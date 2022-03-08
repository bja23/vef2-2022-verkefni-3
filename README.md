# verkefni-3

Hardcoded admin account:
user: admin
pass: 123

curl dæmi:

Login:
curl --location --request POST 'http://localhost:7777/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{
"username": "admin",
"password": "123"
}'

get events:
curl --request GET 'http://localhost:7777/events/'

register for event 1 (need to switch with token that has not expired):
curl --request POST 'http://localhost:7777/events/1/register' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ1ODkzMjY3LCJleHAiOjE2NDU5MTMyNjd9.ophs00ox6jg3WBWmJLWlOWuurvGHt71CqnkqzJrYOPU' \
--header 'Content-Type: application/json' \
--data-raw '{
"comment":"123"
}'
