import { useParams } from "react-router";

import { ProjectPage } from "@/features/project";

export function ProjectRoute(): React.JSX.Element {
  const { slug } = useParams();
  return <ProjectPage slug={slug} />;
}
