import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app


@app.route('/api/device/get_sensors', methods=['GET'])
def get_sensors():
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM device WHERE type="Sensor"')
        data = cursor.fetchall()
        print(data)
        conn.close()

        return jsonify({'data': data}), 200
    except Exception as e:
        logging.error(f"Error in API call '/api/device/get_sensors':\n{str(e)}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/device/get_actuators', methods=['GET'])
def get_actuators():
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM device WHERE type="Actuator"')
        data = cursor.fetchall()
        print(data)
        conn.close()

        return jsonify({'data': data}), 200
    except Exception as e:
        logging.error(f"Error in API call '/api/device/get_actuators':\n{str(e)}")
        return jsonify({'error': str(e)}), 500