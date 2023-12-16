from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


def reset_database():
    conn = sqlite3.connect('smart_gardening_db.db')
    cursor = conn.cursor()

    cursor.execute('''
        DELETE FROM measurement;
    ''')

    cursor.execute('''
        DELETE FROM actuator_group;
    ''')

    cursor.execute('''
        DELETE FROM threshold;
    ''')

    cursor.execute('''
        DELETE FROM command;
    ''')

    cursor.execute('''
        DELETE FROM device;
    ''')

    conn.commit()
    conn.close()


# Initialize SQLite database with initial entries
def setup_database():
    conn = sqlite3.connect('smart_gardening_db.db')
    cursor = conn.cursor()

    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS device (
            id STRING PRIMARY KEY,
            name TEXT,
            type TEXT,
            measure_type TEXT,
            measure_amount INTEGER
        )
    ''')

    cursor.execute('''
            CREATE TABLE IF NOT EXISTS measurement (
                sensor_id STRING,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                value REAL,
                measure_value TEXT,
                PRIMARY KEY (sensor_id, timestamp, measure_value),
                FOREIGN KEY (sensor_id) REFERENCES device(id)
            )
        ''')

    cursor.execute('''
            CREATE TABLE IF NOT EXISTS actuator_group (
            sensor_id STRING,
            actuator_id STRING,
            name STRING,
            PRIMARY KEY (sensor_id, actuator_id),
            FOREIGN KEY (sensor_id) REFERENCES device(id),
            FOREIGN KEY (actuator_id) REFERENCES device(id)
        )
    ''')

    cursor.execute('''
            CREATE TABLE IF NOT EXISTS threshold (
            id STRING,
            measure_type TEXT,
            value REAL,
            PRIMARY KEY (id, measure_type, value),
            FOREIGN KEY (id) REFERENCES device(id)
        )
    ''')

    cursor.execute('''
            CREATE TABLE IF NOT EXISTS action_status (
            id STRING PRIMARY KEY,
            value REAL,
            FOREIGN KEY (id) REFERENCES device(id)
        )
    ''')

    conn.commit()
    conn.close()


setup_database()


# reset_database()


# API endpoint to add data
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


@app.route('/api/newDevices', methods=['GET'])
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


# API endpoint to get all data
@app.route('/api/devices', methods=['GET'])
def get_all_devices():
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM device')
        data = cursor.fetchall()
        conn.close()

        return jsonify({'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/device', methods=['POST'])
def update_device():
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


@app.route('/api/measurements', methods=['GET'])
def get_all_measurements():
    try:
        conn = sqlite3.connect('smart_gardening_db.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM measurement')
        data = cursor.fetchall()
        conn.close()

        return jsonify({'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
