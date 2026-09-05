"use client"
import React, { useRef, useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Pen, BookOpen, Sparkles, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/authService';
import { getFirebaseErrorMessage } from '@/lib/utils';

const Page = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const router = useRouter()
    const reset = () => {
        setEmail("");
        setPassword("");
        formRef.current?.reset();
    }

    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // ✅ Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        try {
            setLoading(true)
            const result = await adminLogin(email, password);
            if (result && result.isAdmin) {
                setLoading(false)
                toast.success("Logged in successfully!");
                setTimeout(() => {
                    router.push("/admin")
                }, 500)
            } else {
                toast.error("Access denied: not an admin");
                setLoading(false)
            }
            

        } catch (error: any) {
            const errorMsg = getFirebaseErrorMessage(error.message)
            toast.error(errorMsg);
            setLoading(false)
            return
        } finally {
            // reset()

        }
    };
    return (
        <div className='flex items-center justify-center w-full'>
            <div className='flex items-center'>
                {/* Right side - Login form */}
                <Card className="w-[90%] sm:w-[500px] mx-auto border-gray-200 bg-white shadow-2xl">
                    <CardHeader className="space-y-1 text-center pb-3 gap-1">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <Link href={'/'}>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Code className="w-5 h-5 text-white" />
                                        </div>
                                        {/* <span className='font-medium italic text-xl tracking-[1px]'>TelexBlog</span> */}
                                    </div>
                                </Link>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-gray-800">
                            Welcome Back Admin
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                            Sign in to continue 
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-3">
                        <form action="" ref={formRef} className='flex flex-col gap-4'>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-4 h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-600 focus:ring-blue-600 h-12 hover:border-blue-400 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-600 focus:ring-blue-600 h-12 hover:border-blue-400 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0" />
                                    <span className="text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                                </label>
                                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline">
                                    Forgot password?
                                </a>
                            </div>

                            <Button
                                onClick={(e) => handleLogin(e)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        Sign In
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>

                        </form>
                    </CardContent>


                </Card>
            </div>
        </div>
    )
}

export default Page
