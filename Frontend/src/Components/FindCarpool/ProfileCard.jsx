import React, { useState, useEffect } from "react";
import { Star, User, MessageCircle } from "lucide-react";
import Button from "../ui/compatibility-button";
import { cn } from "../../lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

const ProfileCard = ({ profileId, open, onOpenChange, className }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const mockProfile = {
                name: "Ali Raza",
                rating: 4.7,
                department: "Computer Science",
                batch: "Batch 2022",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                ridesOffered: 12,
                ridesTaken: 7,
            };
            setProfile(mockProfile);
            setLoading(false);
        }, 1000);
    }, [profileId]);

    if (loading) {
        return (
            <div className={cn("bg-card border border-border rounded-lg p-4 animate-pulse text-center", className)}>
                Loading profile...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={cn("bg-card border border-border rounded-lg p-4 text-center text-red-500", className)}>
                Failed to load profile.
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Profile</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center py-4">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-4">

                        <User className="h-12 w-12 text-primary-600 dark:text-primary-300" />

                    </div>

                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.department} • {profile.batch}</p>

                    <div className="flex items-center mt-2">
                        <Star className="h-5 w-5 text-yellow-500 mr-1" fill="currentColor" />
                        <span className="font-medium">{profile.rating.toFixed(1)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6 w-full max-w-xs">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{profile.ridesOffered || 0}</p>
                            <p className="text-sm text-muted-foreground">Rides Offered</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{profile.ridesTaken || 0}</p>
                            <p className="text-sm text-muted-foreground">Rides Taken</p>
                        </div>
                    </div>

                    <div className="w-full border-t border-border mt-6 pt-4">
                        <Button className="w-full flex-1 bg-primary text-sm h-10 dark:bg-button-dark dark:hover:bg-button-hover text-white dark:text-white">
                            Message
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileCard;
