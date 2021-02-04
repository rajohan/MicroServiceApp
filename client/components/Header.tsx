import Link from "next/link";
import React from "react";

interface Props {
    currentUser: null | { email: string };
}

const Header: React.FC<Props> = ({ currentUser }: Props) => {
    const links = [
        !currentUser && { label: "Sign Up", href: "/auth/signup" },
        !currentUser && { label: "Sign In", href: "/auth/signin" },
        currentUser && { label: "Sell Tickets", href: "/tickets/new" },
        currentUser && { label: "My Orders", href: "/orders" },
        currentUser && { label: "Sign out", href: "/auth/signout" }
    ]
        .filter(() => true)
        .map((link) => {
            if (link) {
                return (
                    <li key={link.href} className="nav-item">
                        <Link href={link.href}>
                            <a className="nav-link">{link.label}</a>
                        </Link>
                    </li>
                );
            }
        });

    return (
        <nav className="navbar navbar-light bg-light">
            <Link href="/">
                <a className="navbar-brand">GitTix</a>
            </Link>
            <div className="d-flex justify-content-end">
                <ul className="nav d-flex align-items-center">{links}</ul>
            </div>
        </nav>
    );
};

export default Header;
