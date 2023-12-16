import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app

# API endpoint for arduino ping to server
@app.route('/api/device/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        incoming_id = data['id']

        #check if device already exists in the DB
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''SELECT id FROM device WHERE id=(?)''', (incoming_id,))
        conn.commit()
        data = cursor.fetchall()
        if len(data) != 0:
            conn.close()
            return jsonify({'message': 'OK'}), 200
        
        #add new device id to the table
        cursor.execute('INSERT INTO device (id) VALUES (?)', (incoming_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Data added successfully'}), 201
    
    except Exception as e:
        logging.error(f"Error in API call '/api/register':\n{str(e)}")
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
        return jsonify({'error': str(e)}), 500
    

# API entrypoint for adds or modifies info stored in the DB for a specific device
@app.route('/api/device/modify_info', methods=['POST'])
def modify_device_info():
    try:

        received_data = request.get_json()
        id = received_data['id']
        name = received_data['name']
        device_type = received_data['deviceType']
        measure_type = received_data['measureType']
        measure_amount = received_data['measureAmount']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''
                UPDATE device
                SET name = ?, type = ?, measure_type = ?, measure_amount = ?
                WhERE id = ? 
            ''',(name, device_type, measure_type, measure_amount, id))
        conn.commit()
        conn.close()

        return jsonify({'message': 'OK'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500