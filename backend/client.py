import os
import requests

HOST = "127.0.0.1"
PORT = 5000

def check_new_device():
    response = requests.get(f"http://{HOST}:{PORT}/api/device/new")
    return response.json()

def list_sensors():
    response = requests.get(f"http://{HOST}:{PORT}/api/device/get_sensors")
    return response.json()

def list_actuators():
    response = requests.get(f"http://{HOST}:{PORT}/api/device/get_actuators")
    return response.json()

def list_groups():
    response = requests.get(f"http://{HOST}:{PORT}/api/group/request")
    return response.json()


def create_group():
    counter = 1
    for actuator in list_actuators()['data']:
        print(f"[{counter}] {actuator[1]} with ID {actuator[0]}")
        counter += 1

    user_input = int(input("Select actuator> ")) - 1
    response =  requests.get(f"http://{HOST}:{PORT}/api/group/sensors/{list_actuators()['data'][user_input][0]}")
    data = response.json()['data']

    print(f"Groupname is '{data['group_name']}'")

    print(f"Assigned Sensors:")
    for assigned_sensor in data['assigned_sensors']:
        print(f"\tSensor Name: {assigned_sensor[1]}\tSensor Type: {assigned_sensor[2]}\tSensor ID: {assigned_sensor[0]}")

    print(f"Unassigned Sensors:")
    for unassigned_sensors in data['unassigned_sensors']:
        print(f"\tSensor Name: {unassigned_sensors[1]}\tSensor Type: {unassigned_sensors[2]}\tSensor ID: {unassigned_sensors[0]}")

    return ""
    

def option_menu():
    counter = 1
    options = {
        'Check new devices': check_new_device,
        'Setup new device': None,
        'List sensors': list_sensors,
        'List actuators': list_actuators,
        'List groups': list_groups,
        'Create group': create_group
        }

    for option in options.keys():
        print(f"[{counter}] {option}")
        counter += 1

    user_input = int(input(">")) - 1

    if options.get(list(options)[user_input]) == None:
        print("[i]Info: Function comming soon")
        return
    
    print(options.get(list(options)[user_input])())


def main():
    while True:
        try:
            option_menu()
        except AttributeError:
            print("[!]Error: Input has to be a number")
        finally:
            input("Press 'ENTER' to continue...")
            os.system("cls")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
    except Exception as e:
        raise e