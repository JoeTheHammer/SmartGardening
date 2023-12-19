import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app


# This module manages all the group creation/deletion that are needed to create the logic for the actuator in combination
# with the sensors that are connected to it. In generall there is 1 actuator, which can have n-amount of sensors connected to it.
# The API starts with '/api/group/<service_name>'


# API entrypoint that gets called to retrieve all groups and if an actuator is specified filter by the actuator
@app.route('/api/group/request', methods=['POST'])
def get_group():
    try:
        data = request.get_json()
        actuator = None
        # try to fetch the actuator from the POST-request if it exists
        try:actuator = data['acuator']
        except:pass

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        if actuator is None: cursor.execute('''SELECT name FROM actuator_group''')
        else: cursor.execute('''SELECT name FROM actuator_group WHERE actuator_id=(?)''', (actuator,))
        conn.commit()
        data = cursor.fetchall()
        conn.close()
        return jsonify({'message': data}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/group/request':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that gets called by user to create a group based on the actuator
@app.route('/api/group/update', methods=['POST'])
def update_group():
    try:
        data = request.get_json()
        actuator_id = data['actuator_id']
        sensor_id = data['sensor_id']
        group_name = data['group_name']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''
                UPDATE actuator_group
                SET sensor_id = ?, actuator_id = ?, name = ?
            ''',(sensor_id, actuator_id, group_name,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'OK'}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/group/update':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API entrypoint that deletes a group 
@app.route('/api/group/delete', methods=['POST'])
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