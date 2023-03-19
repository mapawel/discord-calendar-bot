import { SpelunkerModule } from 'nestjs-spelunker';
import { INestApplication } from '@nestjs/common';
import { writeFile } from 'fs/promises';

export class DependenciesAnalizer {
  constructor(private readonly app: INestApplication) {}

  public async start(): Promise<void> {
    const tree = SpelunkerModule.explore(this.app);
    const root = SpelunkerModule.graph(tree);
    const edges = SpelunkerModule.findGraphEdges(root);
    const mermaidEdges = edges.map(
      ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
    );

    const graphTest = `graph LR\n${mermaidEdges.join('\n')}`;
    const graph: string = this.generateMermaidGraph(graphTest);
    await this.writeGraph(graph);
  }

  private generateMermaidGraph(textContent: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        </script>
      </head>
      <body>
        <pre class="mermaid">
          ${textContent}
      </pre>
      </body>
      </html>
      `;
  }

  private async writeGraph(graph: string) {
    await writeFile(`./Dependencies-analizer/modules-graph.html`, graph);
  }
}
