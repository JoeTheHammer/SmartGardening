import logging

from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS

from util import database

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


#logging setup stuff
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

database.setup_database(r"C:\Users\luca\Documents\Project_IOT\SmartGardening-main\SmartGardening-main\backend\smart_gardening_db.db")
#reset_database()




# API endpoint for arduino ping to server
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        incoming_id = data['id']

        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO device (id) VALUES (?)', (incoming_id,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Data added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# API endpoint for unconfigured devices
@app.route('/api/new_devices', methods=['GET'])
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


# API endpoint for sending masurement data
@app.route('/api/report', methods=['POST'])
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


# API entrypoint for adds or modifies info stored in the DB for a specific device
@app.route('/api/modify_device_info', methods=['POST'])
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


# API entrypoint that retrieves all masurement data of a specific sensor
@app.route('/api/get_measurements', methods=['GET'])
def get_measurements():
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM measurement')
        data = cursor.fetchall()
        conn.close()

        return jsonify({'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API entry to check if an actuator has to perform a task
@app.route('/api/get_actuator_task', methods=['GET'])
def get_actuator_task():
    return jsonify({'data': "data"}), 200

# API entrypoint that gets called by user action
@app.route('/api/update_actuator_task', methods=['POST'])
def update_actuator_task():
    return jsonify({'data': "data"}), 200


# API entrypoint that gets called by user to create a group based on the actuator (1 a; n s)
@app.route('/api/update_actuator_task', methods=['POST'])
def update_actuator_task():
    return jsonify({'data': "data"}), 200

# API entrypoint that creates/updates a group 
@app.route('/api/update_group', methods=['POST'])
def update_actuator_task():
    return jsonify({'data': "data"}), 200


# API entrypoint that deletes a group 
@app.route('/api/delete_group', methods=['POST'])
def delete_group():
    return jsonify({'data': "data"}), 200

# API entry to get devices (-> filtered by actuator and sensors that belong together else send all devices back)
@app.route('/api/get_devices', methods=['GET'])
def get_devices():
    return jsonify({'data': "data"}), 200


# API entrypoint that creates/updates a group 
@app.route('/api/update_threshold', methods=['POST'])
def update_threshold():
    return jsonify({'data': "data"}), 200


# API entrypoint that deletes a group 
@app.route('/api/delete_threshold', methods=['POST'])
def delete_threshold():
    return jsonify({'data': "data"}), 200


# API entrypoint that retrieves the threshold based on the actuator
@app.route('/api/get_threshold', methods=['GET'])
def get_threshold():
    return jsonify({'data': "data"}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
