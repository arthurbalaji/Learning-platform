from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)