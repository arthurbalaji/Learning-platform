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

        # Get in-progress courses
        enrolled_courses_response = requests.get(f"{BASE_URL}/users/{user_id}/enrolled-courses")
        if enrolled_courses_response.status_code != 200:
            return jsonify({"error": "Failed to get in-progress courses"}), 500
        enrolled_courses = enrolled_courses_response.json()

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
                        [course["name"] for course in completed_courses] + \
                        [course["name"] for course in enrolled_courses]

        if not user_course_titles:
            return jsonify([])  # Return empty list if no interests or courses

        # Create DataFrame of all courses
        all_courses_df = pd.DataFrame(all_courses)

        # Filter out courses that are either in progress or completed
        in_progress_and_completed_ids = {course["id"] for course in in_progress_courses + completed_courses + enrolled_courses}
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

        # Prepare texts for similarity analysis
        question_texts = [q['question']['name'] for q in quiz_summary['questionSummaries']]
        lesson_texts = [lesson['name'] for lesson in lessons]
        
        try:
            # Create and fit TF-IDF vectorizer
            vectorizer = TfidfVectorizer(stop_words='english')
            all_texts = question_texts + lesson_texts
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            
            # Split vectors and calculate similarity
            question_vectors = tfidf_matrix[:len(question_texts)]
            lesson_vectors = tfidf_matrix[len(question_texts):]
            similarity_matrix = cosine_similarity(question_vectors, lesson_vectors)
            
            # Initialize knowledge areas
            knowledge_areas = {lesson['name']: 0.0 for lesson in lessons}
            
            # Analyze each question
            for idx, question_summary in enumerate(quiz_summary['questionSummaries']):
                is_correct = question_summary['correct']
                if is_correct:
                    correct_answers += 1
                
                question_similarities = similarity_matrix[idx]
                for lesson_idx, similarity_score in enumerate(question_similarities):
                    if similarity_score > 0.3:
                        lesson = lessons[lesson_idx]
                        lesson_name = lesson['name']
                        knowledge_score = (1.0 if is_correct else 0.0) * similarity_score
                        knowledge_areas[lesson_name] += knowledge_score

            # Calculate overall performance
            overall_score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

            # Normalize knowledge scores
            for lesson_name in knowledge_areas:
                lesson_idx = lesson_texts.index(lesson_name)
                relevant_questions = sum(
                    1 for idx in range(len(question_texts))
                    if similarity_matrix[idx][lesson_idx] > 0.1
                )
                if relevant_questions > 0:
                    knowledge_areas[lesson_name] /= relevant_questions

            # Process easy lessons
            easy_lessons = [
                lesson for lesson in lessons
                if lesson.get('difficultyLevel') == 'EASY'
            ]

            lessons_to_complete = []
            if overall_score >= 70:
                for lesson in easy_lessons:
                    if lesson['name'] in knowledge_areas and knowledge_areas[lesson['name']] >= 0.3:
                        lessons_to_complete.append(lesson)
                        try:
                            complete_response = requests.post(
                                f"{BASE_URL}/users/{user_id}/courses/{course_id}/lessons/{lesson['id']}/complete"
                            )
                            if complete_response.status_code != 200:
                                print(f"Failed to mark lesson {lesson['id']} as completed")
                        except Exception as e:
                            print(f"Error marking lesson {lesson['id']} as completed: {str(e)}")

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
                    {"id": lesson['id'], "name": lesson['name']}
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
            return jsonify({"status": "error", "error": str(e)}), 500

    except Exception as e:  # Add this to close the outer try block
        print(f"Error in analyze_intro_quiz_knowledge: {str(e)}")
        return jsonify({
            "status": "error", 
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)