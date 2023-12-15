# API Backend - Frontend

## /newDevices

Type: GET

Input: -

Output: List with

- id: String
- (info: String)

## /configureDevice

Type: POST

Input:

- id: String
- name: String
- type: String
- MeasureType: String
- MeasureAmount: int

Output:

- Status Code

## /getMeasurement

Type: GET

Input:

- id: String

Output: List with

- dateTime: dateTime
- value: double
- measureValue: String
