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
@app.route('/api/actuator/get_task/<actuator_id>', methods=['GET'])
def get_actuator_task(actuator_id):
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''SELECT status FROM action_status WHERE id=?''',(actuator_id, ))
        conn.commit()
        status = cursor.fetchall()[0][0]
        
        cursor.execute('SELECT update_interval FROM device WHERE id=?', (actuator_id,))
        conn.commit()
        data = cursor.fetchall()

        conn.close()
        return jsonify({'message': status, 'sleep': data[0][0]}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/actuator/get_task/{actuator_id}':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that gets called by user action
@app.route('/api/actuator/update_task', methods=['POST'])
def update_actuator_task():
    try:
        data = request.get_json()
        id = data['id']
        status = data['status']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''INSERT OR REPLACE INTO action_status(id, status)VALUES(?, ?)''',(id, status, ))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/actuator/update_task':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
    