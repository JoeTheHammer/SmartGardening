import requests


def insert_measuremet_data(value):
    # Set the URL of your Flask API endpoint
    api_url = 'http://localhost:5000/api/report'

    # Data to be sent in the request body
    data = {'mac': '123:324:ddd:234', 'value': value}

    try:
        # Make a POST request to the API endpoint
        response = requests.post(api_url, json=data)

        # Check if the request was successful (status code 201)
        if response.status_code == 201:
            print("Data reported successfully")
        else:
            print(f"Error: {response.status_code} - {response.json()['error']}")
    except Exception as e:
        print(f"An error occurred: {e}")


def register_device():
    # Set the URL of your Flask API endpoint
    api_url = 'http://localhost:5000/api/register'

    # Data to be sent in the request body
    data = {'id': '123:324:xxx:234'}

    try:
        # Make a POST request to the API endpoint
        response = requests.post(api_url, json=data)

        # Check if the request was successful (status code 201)
        if response.status_code == 201:
            print("Device Registered successfully")
        else:
            print(f"Error: {response.status_code} - {response.json()['error']}")
    except Exception as e:
        print(f"An error occurred: {e}")


# register_device()
register_device()
