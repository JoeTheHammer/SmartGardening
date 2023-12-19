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
        conn.commit()
        data = cursor.fetchall()
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
        conn.commit()
        data = cursor.fetchall()
        
        for i in range(0, len(data)):
            actuator_id = data[i][0]
            cursor.execute('SELECT status FROM action_status WHERE id=?', (actuator_id,))
            conn.commit()
            actuator_status = cursor.fetchall()
            data[i] += actuator_status[0]

        conn.close()

        return jsonify({'data': data}), 200
    
    except Exception as e:
        logging.error(f"Error in API call '/api/device/get_actuators':\n{str(e)}")
        return jsonify({'error': str(e)}), 500


# API endpoint for deleting a device
@app.route('/api/device/delete', methods=['GET'])
def delete_sensors():
    try:
        data = request.get_json()
        id = data['id']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('DELETE FROM device WHERE id=?', (id,))
        cursor.execute('DELETE FROM measurement WHERE sensor_id=?', (id,))
        cursor.execute('DELETE FROM actuator_group WHERE sensor_id=?', (id,))
        cursor.execute('DELETE FROM threshold WHERE id=?', (id,))
        cursor.execute('DELETE FROM action_status WHERE id=?', (id,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'OK'}), 201
    
    except AttributeError:
        logging.debug("Atrribute error in API call '/api/measurement/get'")
        return '', 422
    
    except Exception as e:
        logging.error(f"Error in API call '/api/device/get_sensors':\n{str(e)}")
        return jsonify({'error': str(e)}), 500