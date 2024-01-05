import logging
import sqlite3

from flask import request
from flask import jsonify
from flask import Response

from __main__ import app

# This module takes care of all the setup process of each device that connects to the server
# The route of this API starts with '/api/device/<service_name>'


# API endpoint for arduino ping to server
@app.route('/api/device/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        device_id = data['id']

        #check if device already exists in the DB
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''SELECT id FROM device WHERE id=(?)''', (device_id,))
        conn.commit()
        data = cursor.fetchall()
        if len(data) != 0:
            conn.close()
            return jsonify({'message': 'OK'}), 200
        
        #add new device id to the table and return http status created to client
        cursor.execute('INSERT INTO device (id) VALUES (?)', (device_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Data added successfully'}), 201
    
    except Exception as e:
        logging.error(f"Error in API call '/api/device/register':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
    

# API endpoint for unconfigured devices
@app.route('/api/device/new', methods=['GET'])
def new_devices():
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM device WHERE name is null')
        data = cursor.fetchall()
        conn.commit()
        conn.close()

        return jsonify({'data': data}), 200

    except Exception as e:
        logging.error(f"Error in API call '/api/device/new':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
    

# API entrypoint for adds or modifies info stored in the DB for a specific device
@app.route('/api/device/modify_info', methods=['POST'])
def modify_device_info():
    try:

        received_data = request.get_json()
        id = received_data['id']
        name = received_data['name']
        device_type = received_data['deviceType']
        sensor_type = received_data['sensorType']
        measure_amount = received_data['measureAmount']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''
                UPDATE device
                SET name = ?, type = ?, sensor_type = ?, measure_amount = ?
                WhERE id = ? 
            ''',(name, device_type, sensor_type, measure_amount, id))
        conn.commit()

        if device_type == "Actuator":
            cursor.execute('''SELECT status FROM action_status WHERE id=?''',(id, ))
            conn.commit()
            if(len(cursor.fetchall()) == 0):
                cursor.execute('''INSERT INTO action_status(id) VALUES(?)''',(id, ))
            cursor.execute('''UPDATE action_status SET status=? WHERE id=?''',(0, id, ))
            conn.commit()
        conn.close()

        return jsonify({'message': 'OK'}), 201

    except Exception as e:
        logging.error(f"Error in API call '/api/device/modify_info':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/device/update/<device_id>', methods=['GET'])
def get_device_update(device_id):
    data = open("C:\\Users\\luca\\Desktop\\update.bin", 'rb').read()
    return data, 200