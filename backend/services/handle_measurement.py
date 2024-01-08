import logging
import sqlite3
import threading

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
        sensor_id = data['id']
        value = str(data['value']).split(";")

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT sensor_type, update_interval FROM device WHERE id = ?', (sensor_id,))
        conn.commit()
        data = cursor.fetchall()
        print(data)

        if data[0][0] is None:
            conn.close()
            return '', 404

        #data[0][0] gets the type of sensor
        counter = 0
        sensor_types = data[0][0].split("/")
        for sensor_type in sensor_types:
            cursor.execute('INSERT INTO measurement (sensor_id, value, measure_type) VALUES(?, ?, ?)', (sensor_id, value[counter], sensor_type))
            conn.commit()
            t = threading.Thread(target=check_threshold, args=(sensor_id, sensor_type, value[counter]))
            t.start()
            counter += 1

        conn.close()
        return jsonify({'message': 'OK', 'sleep': data[0][1]}), 201
    
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
@app.route('/api/measurement/request/<id>', methods=['GET'])
def request_measurement(id):
    try:
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
    


# Check if a threshold has been reached.
# If this is the case change the internal state for the actuator.
def check_threshold(sensor_id: str, sensor_type: str, value: int):
    conn = sqlite3.connect('smart_gardening_db.db')
    cursor = conn.cursor()

    cursor.execute('''SELECT DISTINCT actuator_id FROM actuator_group WHERE sensor_id=?''', (sensor_id, ))
    conn.commit()
    actuator_ids = cursor.fetchall()

    if len(actuator_ids) != 0:
        for actuator_id in actuator_ids:
            actuator_id = actuator_id[0]

            cursor.execute('''SELECT value, isLower FROM threshold WHERE id=? AND measure_type=?''', (actuator_id, sensor_type))
            conn.commit()
            sensor_data = cursor.fetchall()

            if len(sensor_data) == 0:continue
            else:
                threshold = int(sensor_data[0][0])
                isLower = int(sensor_data[0][1])

            if isLower == 1:
                if int(value) <= threshold:
                    cursor.execute('''INSERT OR REPLACE INTO action_status(id, status)VALUES(?, ?)''',(actuator_id, 1, ))
                    conn.commit()
                    print(f"Updated value of actuator {actuator_id} to on")
                else:
                    cursor.execute('''INSERT OR REPLACE INTO action_status(id, status)VALUES(?, ?)''',(actuator_id, 0, ))
                    conn.commit()
                    print(f"Updated value of actuator {actuator_id} to off")
            else:
                if int(value) >= threshold:
                    cursor.execute('''INSERT OR REPLACE INTO action_status(id, status)VALUES(?, ?)''',(actuator_id, 1, ))
                    conn.commit()
                    print(f"Updated value of actuator {actuator_id} to on")
                else:
                    cursor.execute('''INSERT OR REPLACE INTO action_status(id, status)VALUES(?, ?)''',(actuator_id, 0, ))
                    conn.commit()
                    print(f"Updated value of actuator {actuator_id} to off")
            

    conn.close()