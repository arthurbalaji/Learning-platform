from flask import Flask, jsonify, request
import requests
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

BASE_URL = "http://localhost:8080"

@app.route('/users/<int:user_id>/recommended-courses', methods=['GET'])
def get_recommended_courses(user_id):
    user_response = requests.get(f"{BASE_URL}/users/{user_id}")
    if user_response.status_code != 200:
        return jsonify({"error": "User not found"}), 404
    user = user_response.json()

    
    enrolled_courses_response = requests.get(f"{BASE_URL}/users/{user_id}/enrolled-courses")
    if enrolled_courses_response.status_code != 200:
        return jsonify({"error": "Failed to get enrolled courses"}), 500
    enrolled_courses = enrolled_courses_response.json()

    
    completed_courses_response = requests.get(f"{BASE_URL}/users/{user_id}/completed-courses")
    if completed_courses_response.status_code != 200:
        return jsonify({"error": "Failed to get completed courses"}), 500
    completed_courses = completed_courses_response.json()

    
    all_courses_response = requests.get(f"{BASE_URL}/courses")
    if all_courses_response.status_code != 200:
        return jsonify({"error": "Failed to get all courses"}), 500
    all_courses = all_courses_response.json()

    
    user_course_titles = user["interests"] + \
                        [course["name"] for course in enrolled_courses] + \
                        [course["name"] for course in completed_courses]

    
    all_courses_df = pd.DataFrame(all_courses)

    
    enrolled_and_completed_course_ids = {course["id"] for course in enrolled_courses + completed_courses}
    filtered_courses_df = all_courses_df[~all_courses_df["id"].isin(enrolled_and_completed_course_ids)]

    
    vectorizer = TfidfVectorizer()
    user_course_vectors = vectorizer.fit_transform(user_course_titles)
    filtered_course_vectors = vectorizer.transform(filtered_courses_df["name"])

    
    similarity_matrix = cosine_similarity(user_course_vectors, filtered_course_vectors)

    
    average_similarity_scores = similarity_matrix.mean(axis=0)

    
    recommended_course_indices = average_similarity_scores.argsort()[-3:][::-1]

    
    recommended_courses = filtered_courses_df.iloc[recommended_course_indices].to_dict(orient="records")

    return jsonify(recommended_courses)

if __name__ == '__main__':
    app.run(debug=True)