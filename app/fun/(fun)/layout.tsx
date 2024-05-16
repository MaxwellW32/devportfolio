import ViewProjects from "@/components/viewProjects/ViewProjects";

export default function ProjectsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ViewProjects>
            {children}
        </ViewProjects>
    );
}
