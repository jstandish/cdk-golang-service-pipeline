package main_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "my-second-service"
)

var _ = Describe("Main", func() {
	var (
        exampleResponse  MyResponse
    )

    BeforeEach(func() {
        exampleResponse = MyResponse{
            Message:  "second service",
        }
    })

	It("Should respond with second service", func() {
		response, _ := HandleLambdaEvent(nil)
		Expect(response.Message).To(Equal(exampleResponse.Message))
	})
})
