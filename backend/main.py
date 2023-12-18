from flask import Flask
from flask_cors import CORS


# Here are the imports for custom util functions
from util import database
from util import config_logging

# Here is the flask config.
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Here are the imports for the different API services that will be loaded in by flask automaticly
from services import setup_device
from services import handle_device
from services import handle_group
from services import handle_actuator
from services import handle_threshold
from services import handle_measurement


# TODO: Implement 422 status code if varibales are missing in a POST-request
# TODO: Implement flag option to run the server in a different logging mode and also provide option to reset the DB


if __name__ == '__main__':
    database.setup_database("smart_gardening_db.db")
    app.run(debug=True, host='0.0.0.0', port=5000)