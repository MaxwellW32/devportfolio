import HideNav from "@/components/hideNav/HideNav";

export default function ProjectsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <HideNav>
            {children}
        </HideNav>
    );
}
