import logging
import sqlite3

from flask import request
from flask import jsonify

from __main__ import app

# This module handles the masurement data, which get send by the different IOT devices connected to the server.
# Also it provides a way to receive the stored data from the DB.
# The API starts with '/api/measurement/<service_name>'

# TODO: return time for next sensor update after a sensor successfully transmitted data
# API endpoint for sending masurement data
@app.route('/api/measurement/report', methods=['POST'])
def report():
    try:
        data = request.get_json()
        device_id = data['id']
        value = str(data['value']).split(";")

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT sensor_type FROM device WHERE id = ?', (device_id,))
        conn.commit()
        data = cursor.fetchall()

        if data[0][0] is None:
            conn.close()
            return '', 404

        #data[0][0] gets the type of sensor
        counter = 0
        sensor_types = data[0][0].split("/")
        for sensor_type in sensor_types:
            cursor.execute('INSERT INTO measurement (sensor_id, value, measure_type) VALUES(?, ?, ?)', (device_id, value[counter], sensor_type))
            conn.commit()
            counter += 1
        conn.close()

        return jsonify({'message': 'OK'}), 201
    
    except AttributeError:
        logging.debug("Atrribute error in API call '/api/measurement/report'")
        return '', 422
    
    except Exception as e:
        logging.error(f"Error in API call '/api/measurement/report':\n{str(e)}")
        return jsonify({'error': str(e)}), 500



# API entrypoint that retrieves all masurement data of a specific sensor
# Response should look like this:
# {[measure_value: 'Temperature', measurements: [{timestamp: '01.02...', value: 23}, {timestamp: '01.02...', value: 23}],
# [measure_value: 'Humidity', measurements: [{timestamp: '01.02...', value: 23}, {timestamp: '01.02...', value: 23}]]}
# So a list with the elements measure_value that indicates the measure value (like temperature)
# and with measurements, that contain a list with timestamp, value paris for the corresponding sensor and measure value

@app.route('/api/measurement/request', methods=['POST'])
def request_measurement():
    try:
        data = request.get_json()
        id = data['id']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('''SELECT DISTINCT measure_type FROM measurement WHERE sensor_id=?''', (id,))
        conn.commit()
        data = cursor.fetchall()

        response = []
        for i in range(0, len(data)):
            cursor.execute('''SELECT timestamp, value FROM measurement WHERE sensor_id=? AND measure_type=?''', (id, data[i][0]))
            conn.commit()
            values = cursor.fetchall()

            measurements_array = []
            for value in values:
                measurements_array.append({'timestamp': value[0], 'value': value[1]})

            response.append({'measure_value': data[i][0], 'measurements': measurements_array})

        conn.close()
        return jsonify(response), 200
    
    except AttributeError:
        logging.debug("Atrribute error in API call '/api/measurement/request'")
        return '', 422

    except Exception as e:
        return jsonify({'error': str(e)}), 500