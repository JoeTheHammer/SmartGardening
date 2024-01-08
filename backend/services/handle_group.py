import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app


# This module manages all the group creation/deletion that are needed to create the logic for the actuator in combination
# with the sensors that are connected to it. In generall there is 1 actuator, which can have n-amount of sensors connected to it.
# The API starts with '/api/group/<service_name>'


# API entrypoint that gets called to retrieve all groups
@app.route('/api/group/request', methods=['GET'])
def get_group():
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''SELECT name FROM actuator_group''')
        conn.commit()
        data = cursor.fetchall()
        conn.close()
        return jsonify({'message': data}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/group/request':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
    
    
# API entrypoint that gets called to retrieve all groups sorted by an actuator
@app.route('/api/group/sensors/<actuator_id>', methods=['GET'])
def get_group_by_actuator(actuator_id):
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()

        cursor.execute('''SELECT name FROM actuator_group WHERE actuator_id=(?)''', (actuator_id, ))
        conn.commit()
        group_name = cursor.fetchall()
        if len(group_name) == 0: group_name = ''
        else: group_name = group_name[0][0]

        cursor.execute('''SELECT id, name, sensor_type FROM device WHERE type="Sensor" AND id IN (SELECT sensor_id FROM actuator_group WHERE actuator_id=(?))''', (actuator_id,))
        conn.commit()
        assigned_sensors = cursor.fetchall()

        cursor.execute('''SELECT id, name, sensor_type FROM device WHERE type="Sensor" AND id NOT IN (SELECT sensor_id FROM actuator_group WHERE actuator_id=?)''', (actuator_id, ))
        conn.commit()
        unassigned_sensors = cursor.fetchall()
        conn.close()

        return jsonify({'data': {'actuator_id': actuator_id, 
                        'group_name': group_name,
                        'assigned_sensors': assigned_sensors,
                        'unassigned_sensors': unassigned_sensors
                        }}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/group/sensors/{actuator_id}':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that gets called by user to create a group based on the actuator
@app.route('/api/group/update', methods=['POST'])
def update_group():
    try:
        data = request.get_json()
        actuator_id = data['actuatorId']
        group_name = data['groupName']
        sensors = data['sensors']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()

        cursor.execute('''DELETE FROM actuator_group WHERE actuator_id = ?''', (actuator_id, ))
        conn.commit()

        for sensor in sensors:
            sensor_id = sensor['id']
            cursor.execute('''INSERT INTO actuator_group (sensor_id, actuator_id, name) VALUES(?, ?, ?)''', (sensor_id, actuator_id, group_name,))
            conn.commit()

        conn.close()
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/group/update':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that deletes a group 
@app.route('/api/group/delete', methods=['DELETE'])
def delete_group():
    try:
        data = request.get_json()
        group_name = data['group_name']

        #check if group exists in the DB
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''SELECT name FROM actuator_group WHERE name=(?)''', (group_name,))
        conn.commit()
        data = cursor.fetchall()
        # if group does not exists return 410 (resource gone) to client
        if len(data) != 0:
            conn.close()
            return '', 410
        
        # else remove the group and return http status 204 (resource deleted successfully) to the client
        cursor.execute('''DELETE FROM actuator_group WHERE name=(?)''', (group_name,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'OK'}), 204
    
    except Exception as e:
        logging.error(f"Error in API call '/api/group/delete':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


#TODO: Add SQL for removing the sensor from the group
# API entrypoint that deletes a group 
@app.route('/api/group/sensor/delete', methods=['DELETE'])
def delete__sensor_from_group():
    try:
        data = request.get_json()
        group_name = data['groupName']
        sensor_id = data['sensorID']

        #check if group exists in the DB
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''SELECT name FROM actuator_group WHERE name=(?)''', (group_name,))
        conn.commit()
        data = cursor.fetchall()
        # if group does not exists return 410 (resource gone) to client
        if len(data) != 0:
            conn.close()
            return '', 410
        
        # else remove the group and return http status 204 (resource deleted successfully) to the client
        cursor.execute('''DELETE FROM actuator_group WHERE name=(?)''', (group_name,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'OK'}), 204
    
    except Exception as e:
        logging.error(f"Error in API call '/api/group/delete':\n{str(e)}")
        return jsonify({'error': str(e)}), 500