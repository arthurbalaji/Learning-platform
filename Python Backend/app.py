from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import numpy as np
from collections import defaultdict

app = Flask(__name__)

# Enable CORS for all routes with proper configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

BASE_URL = "http://localhost:8080"

@app.route('/users/<int:user_id>/recommended-courses', methods=['GET'])
def get_recommended_courses(user_id):
    try:
        # Get user details
        user_response = requests.get(f"{BASE_URL}/users/{user_id}")
        if user_response.status_code != 200:
            return jsonify({"error": "User not found"}), 404
        user = user_response.json()

        # Get in-progress courses
        in_progress_courses_response = requests.get(f"{BASE_URL}/users/{user_id}/in-progress-courses")
        if in_progress_courses_response.status_code != 200:
            return jsonify({"error": "Failed to get in-progress courses"}), 500
        in_progress_courses = in_progress_courses_response.json()

        # Get completed courses
        completed_courses_response = requests.get(f"{BASE_URL}/users/{user_id}/completed-courses")
        if completed_courses_response.status_code != 200:
            return jsonify({"error": "Failed to get completed courses"}), 500
        completed_courses = completed_courses_response.json()

        # Get all courses
        all_courses_response = requests.get(f"{BASE_URL}/courses")
        if all_courses_response.status_code != 200:
            return jsonify({"error": "Failed to get all courses"}), 500
        all_courses = all_courses_response.json()

        # Check if we have enough data
        if not all_courses:
            return jsonify({"error": "No courses available"}), 404

        # Combine user interests with course names
        user_interests = user.get("interests", [])
        user_course_titles = user_interests + \
                        [course["name"] for course in in_progress_courses] + \
                        [course["name"] for course in completed_courses]

        if not user_course_titles:
            return jsonify([])  # Return empty list if no interests or courses

        # Create DataFrame of all courses
        all_courses_df = pd.DataFrame(all_courses)

        # Filter out courses that are either in progress or completed
        in_progress_and_completed_ids = {course["id"] for course in in_progress_courses + completed_courses}
        filtered_courses_df = all_courses_df[~all_courses_df["id"].isin(in_progress_and_completed_ids)]

        if filtered_courses_df.empty:
            return jsonify([])  # Return empty list if no courses to recommend

        # Calculate similarity
        vectorizer = TfidfVectorizer(min_df=1, stop_words='english')
        try:
            user_course_vectors = vectorizer.fit_transform(user_course_titles)
            filtered_course_vectors = vectorizer.transform(filtered_courses_df["name"].fillna(''))

            # Calculate similarity matrix
            similarity_matrix = cosine_similarity(user_course_vectors, filtered_course_vectors)
            average_similarity_scores = similarity_matrix.mean(axis=0)

            # Get top 3 recommended courses
            recommended_course_indices = average_similarity_scores.argsort()[-3:][::-1]
            recommended_courses = filtered_courses_df.iloc[recommended_course_indices].to_dict(orient="records")

            return jsonify(recommended_courses)

        except Exception as e:
            print(f"Error in recommendation calculation: {str(e)}")
            return jsonify({"error": "Failed to calculate recommendations"}), 500

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>/courses/<int:course_id>/analyze-intro-quiz/<int:quiz_summary_id>', methods=['POST', 'OPTIONS'])
def analyze_intro_quiz_knowledge(user_id, course_id, quiz_summary_id):
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    try:
        # Get quiz summary from Spring backend
        quiz_summary_response = requests.get(
            f"{BASE_URL}/users/{user_id}/courses/{course_id}/intro-quiz-summary/{quiz_summary_id}"
        )
        
        if quiz_summary_response.status_code != 200:
            return jsonify({"error": "Failed to fetch quiz summary"}), 500
        
        quiz_summary = quiz_summary_response.json()
        
        # Get course lessons
        lessons_response = requests.get(f"{BASE_URL}/courses/{course_id}/lessons")
        if lessons_response.status_code != 200:
            return jsonify({"error": "Failed to fetch lessons"}), 500
            
        lessons = lessons_response.json()

        # Analyze quiz performance and knowledge areas
        knowledge_areas = defaultdict(float)
        total_questions = len(quiz_summary['questionSummaries'])
        correct_answers = 0

        for question_summary in quiz_summary['questionSummaries']:
            question = question_summary['question']
            is_correct = question_summary['correct']
            
            # Extract topic from question name (assuming format: "Topic: Question")
            topic = question['name'].split(':')[0].strip() if ':' in question['name'] else question['name']
            
            # Weight the knowledge score based on correctness
            knowledge_score = 1.0 if is_correct else 0.0
            knowledge_areas[topic] += knowledge_score
            
            if is_correct:
                correct_answers += 1

        # Calculate overall performance
        overall_score = (correct_answers / total_questions) * 100

        # Normalize knowledge scores
        for topic in knowledge_areas:
            questions_in_topic = sum(1 for qs in quiz_summary['questionSummaries'] if topic in qs['question']['name'])
            knowledge_areas[topic] /= questions_in_topic

        # Sort lessons by difficulty (assuming lessons have a difficulty property)
        easy_lessons = sorted(
            lessons,
            key=lambda x: x.get('sequence', float('inf'))  # Use sequence as difficulty indicator
        )[:2]  # Get first two lessons (assumed to be easiest)

        lessons_to_complete = []
        if overall_score >= 70:  # If overall performance is good
            for lesson in easy_lessons:
                # Check if lesson topic matches areas of high knowledge
                lesson_topic = lesson.get('name', '').split(':')[0].strip()
                if lesson_topic in knowledge_areas and knowledge_areas[lesson_topic] >= 0.7:
                    lessons_to_complete.append(lesson)
                    
                    # Mark lesson as completed via Spring backend
                    complete_response = requests.post(
                        f"{BASE_URL}/users/{user_id}/courses/{course_id}/lessons/{lesson['id']}/complete"
                    )
                    if complete_response.status_code != 200:
                        print(f"Failed to mark lesson {lesson['id']} as completed")

        # Mark course as in progress
        progress_response = requests.post(
            f"{BASE_URL}/users/{user_id}/courses/{course_id}/in-progress"
        )

        return jsonify({
            "status": "success",
            "quiz_summary_id": quiz_summary_id,
            "overall_score": overall_score,
            "knowledge_areas": dict(knowledge_areas),
            "lessons_completed": [
                {
                    "id": lesson['id'],
                    "name": lesson['name'],
                    "topic": lesson['name'].split(':')[0].strip()
                }
                for lesson in lessons_to_complete
            ],
            "recommendation": (
                "Based on your quiz performance, you can skip the introductory lessons marked as completed."
                if lessons_to_complete
                else "We recommend following all lessons in order."
            )
        })

    except Exception as e:
        print(f"Error analyzing intro quiz: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)