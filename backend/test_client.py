import requests
import random
import time

MACS = ["ughjfeduef", "hgbdhd4653", "64874g3zr", "jor78jn453"]

def insert_measuremet_data(mac, value):
    # Set the URL of your Flask API endpoint
    api_url = 'http://localhost:5000/api/measurement/report'
    print(f"'{mac}' sending value '{value}'")
    # Data to be sent in the request body
    data = {'id': mac, 'value': value}

    response = requests.post(api_url, json=data)
    print(response.status_code)
    try:
        # Make a POST request to the API endpoint
        

        # Check if the request was successful (status code 201)
        if response.status_code == 200 or  response.status_code == 201:
            print("Data reported successfully")
        else:
            print(f"Error: {response.status_code} - {response.json()['error']}")
    except Exception as e:
        print(f"An error occurred: {e}")


def register_device(mac):
    # Set the URL of your Flask API endpoint
    api_url = 'http://localhost:5000/api/device/register'

    # Data to be sent in the request body
    data = {'id': mac}

    try:
        # Make a POST request to the API endpoint
        response = requests.post(api_url, json=data)

        # Check if the request was successful (status code 201)
        if response.status_code == 200 or  response.status_code == 201:
            print("Device Registered successfully")
        else:
            print(f"Error: {response.status_code} - {response.json()['error']}")
    except Exception as e:
        print(f"An error occurred: {e}")


for mac in MACS:
    register_device(mac)

while True:
    for mac in MACS:
        if mac == "jor78jn453":
            #insert_measuremet_data(mac, str(random.uniform(10.5, 75.5)) + ";" + str(random.uniform(10.5, 75.5)))
            insert_measuremet_data(mac, str(random.randint(1,3)) + ";" + str(random.randint(1,3)))
        else:
            #insert_measuremet_data(mac, random.uniform(10.5, 75.5))
            insert_measuremet_data(mac, random.randint(1,3))
        #time.sleep(0.2)
    #time.sleep(1.2)
