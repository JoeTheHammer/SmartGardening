import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app

# This module handles the creation/deletion of thresholds specified by the user.
# The API starts with '/api/threshold/<service_name>'


# API entrypoint that retrieves the threshold based on the actuator
@app.route('/api/threshold/get/<actuator_id>', methods=['GET'])
def get_threshold(actuator_id):
    try:
        data = []
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()

        cursor.execute('''SELECT DISTINCT sensor_type FROM device WHERE type="Sensor" AND id IN (SELECT sensor_id FROM actuator_group WHERE actuator_id=(?))''', (actuator_id,))
        conn.commit()
        assigned_sensors = cursor.fetchall()

        for assigned_sensor in assigned_sensors:
            assigned_sensor = assigned_sensor[0].split('/')

            for sensor_type in assigned_sensor:
                cursor.execute('''SELECT value, isLower FROM threshold WHERE id=? AND measure_type=?''', (actuator_id, sensor_type))
                conn.commit()
                sensor_data = cursor.fetchall()

                if len(sensor_data) == 0:
                    threshold = None
                    isLower = 0
                else:
                    threshold = sensor_data[0][0]
                    isLower = sensor_data[0][1]

                data.append({'measureType': sensor_type, 'threshold': threshold, 'isLower': isLower})

        conn.close()

        return jsonify({'data': data}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/threshold/get/{actuator_id}':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that creates/updates a group 
@app.route('/api/threshold/update', methods=['POST'])
def update_threshold():
    try:
        data = request.get_json()
        actuator_id = data['id']
        threshold_data = data['thresholdData']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()

        cursor.execute('''DELETE FROM threshold WHERE id=?''', (actuator_id, ))
        conn.commit()

        for threshold in threshold_data:
            if threshold['active'] == False:continue
            cursor.execute('''INSERT OR REPLACE INTO threshold(id, measure_type, value, isLower) VALUES(?, ?, ?, ?)''', (actuator_id, threshold['measureType'], threshold['threshold'], threshold['isLower']))
            conn.commit()

        conn.close()

        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/threshold/update':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that deletes threshold for a actuator
@app.route('/api/threshold/delete/<actuator_id>', methods=['DELETE'])
def delete_threshold(actuator_id):
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''DELETE FROM threshold WHERE id=?''', (actuator_id, ))
        conn.commit()
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/threshold/delete':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
