import time
import random
import requests
import threading

THREADS = []
MAC_SENSORS = [
    "4NLtny",
    "IBTaUG",
    "fxFHuF",
    "lxWeqy",
    "wIitnj",
    "99wzgf",
    "pBjGOY",
    "7n5fgu",
    "x1xw9Z",
    "RzGO3b",
    "Q10T0m"
]

MAC_ACTUATORS = [
    "JzqkA9zz",
    "tpp7Lazz",
    "kxhGLbzz",
    "T8zvKZzz"
]

def actuator_simulation(mac):
    try:
        api_url = 'http://localhost:5000/api/actuator/get_task/' + mac
        response = requests.get(api_url)
        if response.status_code > 300:
            return
        
        data = response.json()

        if int(data['message']) == 1:
            print(f"The actuator with mac '{mac}' is on")
        else:
            print(f"The actuator with mac '{mac}' is off")
        time.sleep(int(data['sleep']) / 1000)
    except:pass


def sensor_simulation(mac, value):
    try:
        api_url = 'http://localhost:5000/api/measurement/report'
        value = generate_value(value)
        data = {'id': mac, 'value': value}

        response = requests.post(api_url, json=data)
        print(f"Sensor with ID '{mac}' reported value '{value}' - {response.status_code}")
        time.sleep(int(response.json()['sleep']) / 1000)
        return value
    except:
        return value

def generate_value(value):
    chance_increase = 0.1
    chance_decrease = 0.2
    
    if random.random() < chance_decrease:
        return value - 1
    if random.random() < chance_increase:
        return value + 1
    return value


def register_device(mac):
    api_url = 'http://localhost:5000/api/device/register'
    data = {'id': mac}
    response = requests.post(api_url, json=data)
    print(f"Device with ID '{mac}' registered - {response.status_code}")


def main_simulation(mac):
    register_device(mac)
    value = random.randint(10, 20)
    while True:
        if mac in MAC_SENSORS:
            value = sensor_simulation(mac, value)
        if mac in MAC_ACTUATORS:
            actuator_simulation(mac)


for mac in MAC_SENSORS:
   t = threading.Thread(target=main_simulation, args=(mac, ))
   THREADS.append(t)


for mac in MAC_ACTUATORS:
   t = threading.Thread(target=main_simulation, args=(mac, ))
   THREADS.append(t)


for t in THREADS:
    t.start()

for t in THREADS:
    t.join()
