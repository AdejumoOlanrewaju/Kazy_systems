"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { signInWithGoogle, signInWithFacebook, sendSignInCode, verifySignInCode } from "@/lib/customerAuth"
import { Mail, ArrowLeft } from "lucide-react"

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
)

const FacebookIcon = () => (
    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
)

const SignInPage = () => {
    const router = useRouter()
    const [step, setStep] = useState<"choose" | "email" | "code">("choose")
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const facebookEnabled = process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN === "true"

    const handleGoogle = async () => {
        setLoading(true)
        try {
            await signInWithGoogle()
            toast.success("Signed in!")
            router.push("/")
        } catch (err) {
            console.error(err)
            toast.error("Google sign-in failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleFacebook = async () => {
        setLoading(true)
        try {
            await signInWithFacebook()
            toast.success("Signed in!")
            router.push("/")
        } catch (err) {
            console.error(err)
            toast.error("Facebook sign-in failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await sendSignInCode(email)
            toast.success("Code sent! Check your email.")
            setStep("code")
        } catch (err: any) {
            toast.error(err.message || "Failed to send code")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await verifySignInCode(email, code)
            toast.success("Signed in!")
            router.push("/")
        } catch (err: any) {
            toast.error(err.message || "Invalid code")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-slate-900 mb-2">Sign in</h1>
                    <p className="text-gray-500 text-sm">Track orders and check out faster</p>
                </div>

                {step === "choose" && (
                    <div className="space-y-3">
                        <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full h-12 border-gray-300 font-medium gap-3">
                            <GoogleIcon />
                            Continue with Google
                        </Button>
                        {facebookEnabled && (<Button onClick={handleFacebook} disabled={loading} variant="outline" className="w-full h-12 border-gray-300 font-medium gap-3">
                            <FacebookIcon />
                            Continue with Facebook
                        </Button>)}
                        <Button onClick={() => setStep("email")} disabled={loading} variant="outline" className="w-full h-12 border-gray-300 font-medium gap-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            Continue with Email
                        </Button>

                        <p className="text-xs text-center text-gray-400 pt-4">
                            No account needed to buy — you can still{" "}
                            <button onClick={() => router.push("/shop")} className="underline hover:text-gray-600">
                                checkout as a guest
                            </button>
                        </p>
                    </div>
                )}

                {step === "email" && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <button type="button" onClick={() => setStep("choose")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-slate-900 mb-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email address</label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="h-12" />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                            {loading ? "Sending..." : "Send Code"}
                        </Button>
                    </form>
                )}

                {step === "code" && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <button type="button" onClick={() => setStep("email")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-slate-900 mb-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Enter the 6-digit code sent to {email}
                            </label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456"
                                required
                                className="h-12 text-center text-2xl tracking-widest font-mono"
                            />
                        </div>
                        <Button type="submit" disabled={loading || code.length !== 6} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold disabled:opacity-60">
                            {loading ? "Verifying..." : "Verify & Sign In"}
                        </Button>
                        <button type="button" onClick={handleSendCode as any} className="w-full text-center text-sm text-gray-500 hover:text-slate-900">
                            Didn't get it? Resend code
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default SignInPage