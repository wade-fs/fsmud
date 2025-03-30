package v8funcs

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"fsmud/utils/v8go"
)

func CbHashPassword() v8go.FunctionCallback {
	return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
		iso := info.Context().Isolate()

		if len(info.Args()) == 0 {
			errVal, _ := v8go.NewValue(iso, "Error: Missing password")
			return errVal
		}

		password := info.Args()[0].String()
		hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			errVal, _ := v8go.NewValue(iso, fmt.Sprintf("Error: %s", err))
			return errVal
		}

		result, _ := v8go.NewValue(iso, string(hashed))
		return result
	}
}

func CbComparePassword() v8go.FunctionCallback {
	return func (info *v8go.FunctionCallbackInfo) *v8go.Value {
		iso := info.Context().Isolate()

		if len(info.Args()) < 2 {
			errVal, _ := v8go.NewValue(iso, "Error: Missing parameters")
			return errVal
		}

		hashed := info.Args()[0].String()
		password := info.Args()[1].String()

		err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password))
		result, _ := v8go.NewValue(iso, err == nil) // true if valid, false otherwise
		return result
	}
}
