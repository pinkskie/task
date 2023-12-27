import { useState, useEffect } from 'react'
import { Redirect, Route, useHistory } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

interface FormInputProps {
    value: string
    onChange?: (value: string) => void
    disabled?: boolean
}

interface FormCheckboxProps {
    value: boolean
    onClick: () => void
}

interface PopupProps {
    message: string
    onClose: () => void
}

export default function App() {
    return (
        <BrowserRouter>
            <header className="h-20 bg-primary flex items-center p-4">
                <h1 className="text-3xl text-black">Title</h1>
            </header>
            <main className="flex flex-col p-4 h-full">
                {/* Couldn't import outlet */}
                <Route path="/login/step-1" component={LoginPage} />
                <Route path="/login/step-2" component={AnotherPage} />
                <Redirect from="/" to="/login/step-1" />
            </main>
        </BrowserRouter>
    )
}

const LoginPage = () => {
    const [email, setEmail] = useState<string>('')
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false)
    const [checked, setChecked] = useState<boolean>(false)

    const [holding, setHolding] = useState<boolean>(false)
    const [timeRemaining, setTimeRemaining] = useState<number>(500)

    const history = useHistory()

    const handleChange = (value: string) => {
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
        const validEmail = emailRegex.test(value)

        setEmail(value)
        setIsEmailValid(validEmail)

        if (validEmail) {
            localStorage.setItem('currentEmail', JSON.stringify(value))
        }
    }

    const toggleCheckbox = () => {
        setChecked((prev) => !prev)
    }

    const handleMouseDown = (): void => {
        setHolding(true)
    }

    const handleMouseUp = (): void => {
        setHolding(false)
        setTimeRemaining(500)
    }

    useEffect(() => {
        const prevEmail = localStorage.getItem('currentEmail')

        if (prevEmail) {
            setEmail(JSON.parse(prevEmail))
        }
    }, [])

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (holding && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining((prevTime) => prevTime - 10)
            }, 10)
        }

        return () => {
            clearInterval(timer)
        }
    }, [holding, timeRemaining])

    useEffect(() => {
        if (timeRemaining <= 0) {
            history.push('/login/step-2')
        }
    }, [timeRemaining])

    const isButtonDisabled = !checked || !isEmailValid

    return (
        <>
            <FormInput value={email} onChange={handleChange} />
            <div className="p-1"></div>
            <FormCheckbox value={checked} onClick={toggleCheckbox} />
            <button className="btn btn-primary mt-auto" disabled={isButtonDisabled}>
                Hold to proceed
            </button>

            <button
                className="btn btn-primary mt-3"
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchEnd={handleMouseUp}
                onTouchCancel={handleMouseUp}
            >
                Hold to next page ({(timeRemaining / 1000).toFixed(2)}s)
            </button>
        </>
    )
}

const AnotherPage = () => {
    const [user, setUser] = useState<string>('')
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [serverResponse, setServerResponse] = useState<string>('')

    const handleConfirm = async () => {
        await fetch('http://127.0.0.1:4040/endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user }),
        })
            .then((res) => res.json())
            .then(() => {
                setIsOpen(true)
                setServerResponse('Success !!!')
            })
            .catch(() => {
                setIsOpen(true)
                setServerResponse('Error, next time i will work!')
            })
    }

    useEffect(() => {
        const currentEmail = localStorage.getItem('currentEmail')

        if (currentEmail) {
            setUser(JSON.parse(currentEmail))
        }

        return () => {
            localStorage.removeItem('currentEmail')
        }
    }, [])

    const history = useHistory()

    return (
        <>
            <FormInput value={user} disabled={true} />

            <div className="flex mt-auto w-full gap-2">
                <button className="btn btn-primary bg-white flex-1" onClick={() => history.goBack()}>
                    Back
                </button>
                <button className="btn btn-primary flex-1" onClick={handleConfirm}>
                    Confirm
                </button>
            </div>

            {isOpen && <Popup message={serverResponse} onClose={() => setIsOpen(false)} />}
        </>
    )
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({ value, onClick }) => {
    return (
        <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
                <input type="checkbox" className="checkbox checkbox-primary" checked={value} onChange={onClick} />
                <span className="label-text">I agree</span>
            </label>
        </div>
    )
}

const FormInput: React.FC<FormInputProps> = ({ value, onChange, disabled }) => {
    return (
        <label className="form-control">
            <div className="label">
                <span className="label-text">Email</span>
            </div>
            <input
                type="text"
                placeholder="Type here"
                className="input"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
            />
        </label>
    )
}

const Popup: React.FC<PopupProps> = ({ message, onClose }) => {
    useEffect(() => {
        const handlePopstate = () => {
            onClose()
        }

        window.addEventListener('popstate', handlePopstate)

        return () => {
            window.removeEventListener('popstate', handlePopstate)
        }
    }, [onClose])

    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-50">
            <div className="bg-white p-8 rounded shadow-md">
                <p className="text-lg font-bold mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none text-center"
                >
                    &lt; close
                </button>
            </div>
        </div>
    )
}
