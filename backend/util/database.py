import os
import base64
import sqlite3
import logging

# Rests the SQL DB values
# This is mainly used for testingt purposes
def reset_database(sql_db_path:str):
    sql_queries = [
        '''DELETE FROM measurement;''', 
        '''DELETE FROM actuator_group;''',
        '''DELETE FROM threshold;''',
        '''DELETE FROM action_status;''',
        '''DELETE FROM device;'''
        ]
    execute_sql_queries(sql_db_path , sql_queries)
    logging.info("DB has been reset")


# Deletes the SQL DB
def delete_database(sql_db_path: str):
    if os.path.exists(sql_db_path):
        os.remove(sql_db_path)
        logging.info("DB has been removed")


# Initialize SQL DB with initial entries
# This should be only called on the first start of the server
def setup_database(sql_db_path:str):
    sql_queries = [
        '''CREATE TABLE IF NOT EXISTS device (id STRING PRIMARY KEY, name TEXT, type TEXT, sensor_type TEXT, measure_amount INTEGER)''',
        '''CREATE TABLE IF NOT EXISTS measurement (sensor_id STRING, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, value REAL, measure_type TEXT, PRIMARY KEY (sensor_id, timestamp, measure_type))''',
        '''CREATE TABLE IF NOT EXISTS actuator_group (sensor_id STRING, actuator_id STRING, name STRING, PRIMARY KEY (sensor_id, actuator_id))''',
        '''CREATE TABLE IF NOT EXISTS threshold (id STRING, measure_type TEXT, value REAL, PRIMARY KEY (id, measure_type, value))''',
        '''CREATE TABLE IF NOT EXISTS action_status (id STRING PRIMARY KEY, status INT, updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''',
        '''CREATE TABLE IF NOT EXISTS images (id STRING PRIMARY KEY, img_data STRING)'''
        ]
    
    if not os.path.exists(sql_db_path):
        open(sql_db_path, 'w')
        logging.info("DB has been created")

    execute_sql_queries(sql_db_path , sql_queries)
    logging.info("DB has been initialized")
    update_database_images(sql_db_path)


# Adds images that are stored in '../arduino/bin' as base64 encoded string to the DB
def update_database_images(sql_db_path:str):
    img_directory = "../arduino/bin"
    conn = sqlite3.connect(sql_db_path)
    cursor = conn.cursor()
    
    for img_name in os.listdir(img_directory):
        if not img_name.endswith('.bin'): continue

        img_path = os.path.join(img_directory, img_name)
        data = open(img_path, 'rb').read()
        enc_data = base64.b64encode(data)
        
        cursor.execute('''INSERT OR REPLACE INTO images(id, img_data) VALUES(?, ?)''', (img_name.replace(".bin", ''), enc_data, ))
        logging.info(f"Added new image file {img_path} to DB")

    conn.commit()
    conn.close()


def execute_sql_queries(sql_db_path:str , sql_queries:list) -> list:
    #check if DB exists else throw an error msg to the user
    if not os.path.exists(sql_db_path):
        logging.error("DB does not exists")
        return
    
    #execute all sql queries provided in the list and commit them afterwards
    sql_data = []
    try:
        conn = sqlite3.connect(sql_db_path)
        cursor = conn.cursor()
        for sql_query in sql_queries:
            cursor.execute(sql_query)
            sql_data += cursor.fetchall()

        conn.commit()
        conn.close()
    except Exception as e:
        logging.error(f"Error while executing db queries:\n{str(e)}")
        raise e

    return sql_data