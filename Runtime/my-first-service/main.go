package main
 
import (
	"encoding/json"
	"os"
	"log"
    "net/http"
    "github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/events"
)

var errorLogger = log.New(os.Stderr, "ERROR ", log.Llongfile)

type MyResponse struct {
        Message string `json:"Answer:"`
}
 
func serverError(err error) (events.APIGatewayProxyResponse, error) {
    errorLogger.Println(err.Error())

    return events.APIGatewayProxyResponse{
        StatusCode: http.StatusInternalServerError,
        Body:       http.StatusText(http.StatusInternalServerError),
    }, nil
}

func HandleLambdaEvent(event interface{}) (MyResponse, error) {
        return MyResponse{Message: "first service dev change 2"}, nil
}

func HandleRuest(event interface{}) (events.APIGatewayProxyResponse, error) {
	resp, _ := HandleLambdaEvent(event)

	 // The APIGatewayProxyResponse.Body field needs to be a string, so
    // we marshal the book record into JSON.
    js, err := json.Marshal(resp)
    if err != nil {
        return serverError(err)
    }

    // Return a response with a 200 OK status and the JSON book record
    // as the body.
    return events.APIGatewayProxyResponse{
        StatusCode: http.StatusOK,
        Body:       string(js),
    }, nil
}
 
func main() {
        lambda.Start(HandleRuest)
}