import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app

# This module handles the creation/deletion of thresholds specified by the user.
# The API starts with '/api/threshold/<service_name>'


# API entrypoint that retrieves the threshold based on the actuator
@app.route('/api/threshold/get', methods=['GET'])
def get_threshold():
    try:
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/threshold/get':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that creates/updates a group 
@app.route('/api/threshold/update', methods=['POST'])
def update_threshold():
    try:
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/threshold/update':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that deletes a group 
@app.route('/api/threshold/delete', methods=['POST'])
def delete_threshold():
    try:
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/threshold/delete':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
