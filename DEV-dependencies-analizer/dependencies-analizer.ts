import { SpelunkedTree, SpelunkerModule } from 'nestjs-spelunker';
import { INestApplication } from '@nestjs/common';
import { writeFile } from 'fs/promises';

export class DependenciesAnalizer {
  private readonly filesPath = `./DEV-dependencies-analizer/files`;
  constructor(private readonly app: INestApplication) {}

  public async start(): Promise<string> {
    const tree = SpelunkerModule.explore(this.app);
    const detailedData: SpelunkedTree[] = SpelunkerModule.explore(this.app);
    const root = SpelunkerModule.graph(tree);
    const edges = SpelunkerModule.findGraphEdges(root);
    const mermaidEdges = edges.map(
      ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
    );

    const results = await Promise.all([
      this.generateGraphEdges(mermaidEdges),
      this.generateDetailedData(detailedData),
    ]);
    return `To check dependencies in this project open in browser files below in ${
      this.filesPath
    }:\n${results.join('\n')}`;
  }

  private async generateDetailedData(
    detailedData: SpelunkedTree[],
  ): Promise<string> {
    const fileName = 'modules-details.html';
    const detailedDataString = JSON.stringify(detailedData, null, 2);
    const detailedHTML: string = this.generateHTML(detailedDataString);
    await this.writeFile(fileName, detailedHTML);
    return `-> ${fileName}`;
  }

  private async generateGraphEdges(mermaidEdges: string[]): Promise<string> {
    const fileName = 'modules-graph.html';
    const graphText = `graph LR\n${mermaidEdges.join('\n')}`;
    const graphHTML: string = this.generateHTML(graphText, true);
    await this.writeFile(fileName, graphHTML);
    return `-> ${fileName}`;
  }

  private generateHTML(textContent: string, isGraph = false): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isGraph ? `Dependencies graph` : `Modules list`}</title>
        <script type="module">
          ${
            isGraph &&
            `import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';`
          }
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

  private async writeFile(fileName: string, data: string) {
    await writeFile(`${this.filesPath}/${fileName}`, data);
  }
}
