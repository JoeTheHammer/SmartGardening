import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app

# This module handles the communication to the actuators connected to the server.
# The current actuator status is saved in the DB and will change after the actuator made the task or by user action.
# Also it checks periodicly if a threshold as been reached and changes the state of the actuator
# The API starts with '/api/actuator/<service_name>'


# API entry to check if an actuator has to perform a task
@app.route('/api/actuator/get_task', methods=['GET'])
def get_actuator_task():
    try:
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/actuator/get_task':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that gets called by user action
@app.route('/api/actuator/update_task', methods=['POST'])
def update_actuator_task():
    try:
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/actuator/update_task':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
    

# Check if a threshold has been reached.
# If this is the case change the internal state for the actuator.
def check_threshold():
    return