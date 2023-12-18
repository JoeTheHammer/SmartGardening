import logging

#logging setup information goes here.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

# Change logging for the flask backend
log = logging.getLogger('werkzeug')
log.setLevel(logging.DEBUG)
#log.setLevel(logging.ERROR)