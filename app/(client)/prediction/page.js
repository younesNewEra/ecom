"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SizePredictor() {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [age, setAge] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [predictedSize, setPredictedSize] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({ height: "", weight: "", age: "" })

  const validateInputs = () => {
    const newErrors = { height: "", weight: "", age: "" }
    let isValid = true

    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      newErrors.height = "Please enter a valid height"
      isValid = false
    }

    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.weight = "Please enter a valid weight"
      isValid = false
    }

    if (!age || isNaN(Number(age)) || Number(age) <= 0) {
      newErrors.age = "Please enter a valid age"
      isValid = false
    }    setErrors(newErrors)
    return isValid
  };  
  
  const predictSize = async () => {
    if (!validateInputs()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          height: Number(height),
          weight: Number(weight),
          age: Number(age),
        }),
      })

      // Parse the JSON response
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed')
      }

      if (!data.predicted_size) {
        throw new Error('Invalid prediction result')
      }
      
      setPredictedSize(data.predicted_size)
      setShowResult(true)
    } catch (error) {
      console.error('Error predicting size:', error)
      // Set an error message that will be shown to the user
      setPredictedSize("Error")
      setShowResult(true)
    } finally {
      setIsLoading(false)
    }
  }

  const closeResult = () => {
    setShowResult(false)
  }

  const resetForm = () => {
    setHeight("")
    setWeight("")
    setAge("")
    setShowResult(false)
    setPredictedSize("")
    setErrors({ height: "", weight: "", age: "" })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 pt-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Size Predictor</h1>
          <p className="text-gray-600 mt-2">Our AI model will predict your ideal clothing size</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>We'll use this information to predict your ideal size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Enter your height in cm"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={errors.height ? "border-red-500" : ""}
                />
                {errors.height && <p className="text-red-500 text-sm">{errors.height}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter your weight in kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={errors.weight ? "border-red-500" : ""}
                />
                {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={errors.age ? "border-red-500" : ""}
                />
                {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
              </div>

              <Button onClick={predictSize} className="w-full mt-4" size="lg" disabled={isLoading}>
                {isLoading ? "Processing..." : "Predict Size"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {showResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={closeResult}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
            >
              <Card className="border shadow-xl">
                <CardHeader className="relative pb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={closeResult}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-center">
                    {predictedSize === "Error" ? "Prediction Error" : "Your Predicted Size"}
                  </CardTitle>
                </CardHeader>                <CardContent className="pt-4">
                  <div className="text-center">                    {predictedSize === "Error" ? (
                      <>
                        <span className="text-3xl font-bold text-red-500">Unable to predict size</span>
                        <p className="mt-4 text-gray-600">
                          We couldn't process your request at this time.
                        </p>
                        <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md">
                          <p className="text-sm text-red-700">
                            <strong>Troubleshooting:</strong> Make sure the AI model service is running.
                            <br />
                            • Check that Python is installed with required packages
                            <br />
                            • Verify the model files exist in the AI-model directory
                            <br />
                            • Try running the test integration script
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-6xl font-bold text-gray-900">{predictedSize}</span>
                        <p className="mt-4 text-gray-600">
                          Based on your height ({height}cm), weight ({weight}kg), and age ({age})
                        </p>
                        <p className="mt-2 text-sm text-blue-600">
                          Prediction powered by machine learning
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                  <Button onClick={resetForm} variant="outline" className="mr-2">
                    Reset Form
                  </Button>
                  <Button onClick={closeResult}>Close</Button>
                </CardFooter>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
