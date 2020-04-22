package main_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "my-first-service"
)

var _ = Describe("Main", func() {
	var (
        exampleResponse  MyResponse
    )

    BeforeEach(func() {
        exampleResponse = MyResponse{
            Message:  "first service dev change 2",
        }
    })

	It("Should respond with first service", func() {
		response, _ := HandleLambdaEvent(nil)
		Expect(response.Message).To(Equal(exampleResponse.Message))
	})
})
