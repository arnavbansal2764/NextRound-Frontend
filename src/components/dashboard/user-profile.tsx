'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/hooks/use-toast'

interface User {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: string
}

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedUser, setEditedUser] = useState<User | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const response = await fetch('/api/user/profile')
                if (!response.ok) {
                    throw new Error('Failed to fetch user profile')
                }
                const userData = await response.json()
                setUser(userData)
                setEditedUser(userData)
            } catch (error) {
                console.error('Error fetching user profile:', error)
                toast({
                    title: "Error",
                    description: "Failed to load user profile. Please try again later.",
                    variant: "destructive",
                })
            }
        }
        fetchUserProfile()
    }, [toast])

    const handleSave = async () => {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedUser),
            })

            if (!response.ok) {
                throw new Error('Failed to update user profile')
            }

            const updatedUser = await response.json()
            setUser(updatedUser)
            setIsEditing(false)
            toast({
                title: "Success",
                description: "Your profile has been updated.",
            })
        } catch (error) {
            console.error('Error updating user profile:', error)
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again later.",
                variant: "destructive",
            })
        }
    }

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>User Profile</span>
                        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center mb-4">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                    </div>
                    {isEditing ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={editedUser?.name || ''}
                                    onChange={(e) => setEditedUser(prev => ({ ...prev!, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editedUser?.email || ''}
                                    onChange={(e) => setEditedUser(prev => ({ ...prev!, email: e.target.value }))}
                                />
                            </div>
                            <Button type="submit">Save Changes</Button>
                        </form>
                    ) : (
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

