from flask import Flask
from flask_cors import CORS


# Here are the imports for custom util functions
from util import database
from util import config_logging

# Here is the flask config.
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


if __name__ == '__main__':
    database.setup_database("smart_gardening_db.db")
    app.run(debug=True, host='0.0.0.0', port=5000)