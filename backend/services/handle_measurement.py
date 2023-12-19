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
        data = request.get_json()
        device_id = data['id']
        value = data['value'].split(";")

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT sensor_type FROM device WHERE id = ?', (device_id,))
        conn.commit()
        data = cursor.fetchall()
        if len(data) == 0:
            conn.close()
            return '', 404

        #data[0][0] gets the type of sensor
        counter = 0
        sensor_types = data[0][0].split("/")
        for sensor_type in sensor_types:
            cursor.execute('INSERT INTO measurement (sensor_id, value, measure_type) VALUES(?, ?, ?)', (device_id, value[counter], sensor_type))
            counter += 1
        conn.commit()
        conn.close()

        return jsonify({'message': 'OK'}), 201

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
        #data = request.get_json()
        #id = data['id']
        id = "349454219c58"
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''SELECT measure_type FROM measurement WHERE sensor_id=?''', (id,))
        conn.commit()
        data = cursor.fetchall()

        response = {}
        for d in data[0]:
            print(d)
            cursor.execute('''SELECT timestamp, value FROM measurement WHERE sensor_id=? AND measure_type=?''', (id, d))
            conn.commit()
            values = cursor.fetchall()

            response['measure_value'] = d
            response['measurements'] = []
            for value in values:
                print(value)
                response['measurements'].append({'timestamp': value[0], 'value': value[1]})


        conn.close()
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500