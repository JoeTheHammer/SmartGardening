import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app

# This module handles the masurement data, which get send by the different IOT devices connected to the server.
# Also it provides a way to receive the stored data from the DB.
# The API starts with '/api/measurement/<service_name>'


# API endpoint for sending masurement data
@app.route('/api/measurement/report', methods=['POST'])
def report():
    try:

        print(request.headers)
        print(f"Received: {request.get_json()}")

        return jsonify({'message': 'OK'}), 201

        # conn = sqlite3.connect('smart_gardening_db.db')
        # cursor = conn.cursor()

        # cursor.execute('SELECT measure_type FROM device WHERE MAC = ?', (mac,))

        # data = cursor.fetchall()
        # measure_type = data[0][0]

        # print(measure_type)

        # cursor.execute('INSERT INTO measurement (mac, value, measure_type) VALUES (?,?,?)', (mac, value, measure_type))
        # conn.commit()
        # conn.close()

        # return jsonify({'message': 'Data added successfully'}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500



# API entrypoint that retrieves all masurement data of a specific sensor
# Response should look like this:
# {[measure_value: 'Temperature', measurements: [{timestamp: '01.02...', value: 23}, {timestamp: '01.02...', value: 23}],
# [measure_value: 'Humidity', measurements: [{timestamp: '01.02...', value: 23}, {timestamp: '01.02...', value: 23}]]}
# So a list with the elements measure_value that indicates the measure value (like temperature)
# and with measurements, that contain a list with timestamp, value paris for the corresponding sensor and measure value

@app.route('/api/measurement/get', methods=['GET'])
def get_measurement():
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM measurement')
        data = cursor.fetchall()
        conn.close()

        return jsonify({'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500