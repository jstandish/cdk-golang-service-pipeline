package main
 
import (
        "github.com/aws/aws-lambda-go/lambda"
)

type MyResponse struct {
        Message string `json:"Answer:"`
}
 
func HandleLambdaEvent(event interface{}) (MyResponse, error) {
        return MyResponse{Message: "first service"}, nil
}
 
func main() {
        lambda.Start(HandleLambdaEvent)
}