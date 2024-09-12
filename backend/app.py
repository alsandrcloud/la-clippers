from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True
# Fetch MongoDB configuration from environment variables
MONGO_USER = os.getenv('MONGO_USER', 'intuit')
MONGO_PASS = os.getenv('MONGO_PASS', 'clippers')
MONGO_HOST = os.getenv('MONGO_HOST', 'mongo')
MONGO_PORT = os.getenv('MONGO_PORT', '27017')
MONGO_INITDB_NAME = os.getenv('MONGO_INITDB_NAME', 'tasks_db')

# Construct the Mongo URI
app.config["MONGO_URI"] = f"mongodb://{MONGO_USER}:{MONGO_PASS}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_INITDB_NAME}?authSource=admin"

mongo = PyMongo(app)
tasks = mongo.db.tasks

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    task_id = tasks.insert_one({
        'title': data.get('title'),
        'description': data.get('description')
    }).inserted_id
    return jsonify(str(task_id)), 201

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    # Get page and limit from query parameters, with default values
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5))
    skip = (page - 1) * limit

    try:
        # Fetch tasks with pagination
        tasks = list(mongo.db.tasks.find().skip(skip).limit(limit))
        total = mongo.db.tasks.count_documents({})  # Get the total count of tasks

        # Convert MongoDB ObjectId to string for JSON serialization
        for task in tasks:
            task['_id'] = str(task['_id'])

        return jsonify({'tasks': tasks, 'total': total})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    task = tasks.find_one({'_id': ObjectId(task_id)})
    if task:
        task['_id'] = str(task['_id'])
        return jsonify(task), 200
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    tasks.update_one({'_id': ObjectId(task_id)}, {'$set': data})
    return jsonify({'message': 'Task updated'}), 200

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks.delete_one({'_id': ObjectId(task_id)})
    return jsonify({'message': 'Task deleted'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
