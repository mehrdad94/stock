const rewire = require("rewire")
const common = rewire("./common")
const CommonMiddleware = common.__get__("CommonMiddleware")
// @ponicode
describe("CommonMiddleware", () => {
    test("0", () => {
        let callFunction = () => {
            CommonMiddleware({ use: () => "Anas" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            CommonMiddleware({ use: () => "George" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            CommonMiddleware({ use: () => "Edmond" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            CommonMiddleware({ use: () => "Pierre Edouard" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            CommonMiddleware({ use: () => "Michael" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            CommonMiddleware(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
