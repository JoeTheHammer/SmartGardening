//local config
const int DEFAULT_DELAY = 10000;

//config of network
const char SSID[] = "WiFi-LabIoT";
const char PASS[] = "s1jzsjkw5b";

//config rest API
const char* API_SERVER_IP = "192.168.1.135";
const int API_SERVER_PORT = 5000;
const unsigned long UPDATE_CHECK_INTERVAL = 6000;

const char* UPDATE_PATH = "/api/device/update/default";
const char* REGISTER_PATH = "/api/device/register";
const char* REPORT_PATH = "/api/measurement/report";
const char* TASK_PATH = "/api/actuator/get_task/";