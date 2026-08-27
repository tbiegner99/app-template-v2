import { Card, Chip, ThemeType } from '@__SLUG__/components';
import { FlexColumn } from '@__SLUG__/components';
import { H1, H2, Body, CheckCircle } from '@__SLUG__/components';

function About() {
  const technologies = [
    'React 18',
    'TypeScript',
    'Rspack',
    'Material-UI',
    'CSS Modules',
    'ESLint',
    'Prettier',
  ];

  return (
    <FlexColumn>
      <H1>About This Project</H1>
      <Body>
        This web application is part of the __DISPLAY_NAME__ project, built with modern web technologies
        for optimal performance and developer experience.
      </Body>

      <Card>
        <H2>Technologies Used</H2>
        <FlexColumn gap={1} wrap style={{ marginTop: 16 }}>
          {technologies.map((tech) => (
            <Chip
              key={tech}
              label={tech}
              icon={<CheckCircle />}
              themeType={ThemeType.Info}
              variant="outlined"
            />
          ))}
        </FlexColumn>
      </Card>

      <Card>
        <H2>Features</H2>
        <ul>
          <li>⚡ Fast bundling with Rspack</li>
          <li>🎨 Material Design components with MUI</li>
          <li>🔧 TypeScript for type safety</li>
          <li>📦 CSS Modules for scoped styling</li>
          <li>✨ ESLint + Prettier for code quality</li>
          <li>🔄 Hot Module Replacement for development</li>
        </ul>
      </Card>
    </FlexColumn>
  );
}

export default About;
