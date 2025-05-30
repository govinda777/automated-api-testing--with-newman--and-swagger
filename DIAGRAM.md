```mermaid
classDiagram
    class SwaggerParser {
        +validate(filePath)
    }

    class Builder {
        +convertSwaggerToPostman(swaggerFile)
        +addBasicTests(collection)
    }

    class Runner {
        +runTests(collection)
    }

    class Polling {
        +startPolling()
    }

    class Monitoring {
        +monitorQueues()
    }

    class ReportingAdapter {
        +generateReport(results)
    }

    class PostmanAdapter {
        +runCollection(collection)
    }

    class CICDAdapter {
        +integrateWithPipeline()
    }

    SwaggerParser <|-- Builder
    Builder --> PostmanAdapter
    Builder --> ReportingAdapter
    Runner --> PostmanAdapter
    Runner --> ReportingAdapter
    Runner --> Monitoring
    Runner --> Polling
    CICDAdapter --> Runner
