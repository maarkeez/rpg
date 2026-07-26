## Project structure

- Create one package per bounded context
- Create one subdomain package within the bounded context
- Each subdomain package will have `adapters, domain, usecases` subpackages
- Internally, each of them will be distributed as the following example

```
src
  /main
    /boundedContext/xxx
      /adapters
        /storage
          XxxRepositoryImpl
        /presentation
          XxxReadView
          XxxEditView
          XxxHooks
          XxxContext
          XxxForm
          XxxFormData
      /domain
        Xxx
        XxxError
        XxxEvent
        XxxRepository
      /usecases
        /command
          createXxx
        /queries
          searchXxxById
  /test
```

### Domain

#### For mutations

***Aggregate root***
- [ ] Attributes are private
- [ ] Constructor is private 
- [ ] Created using a static method
- [ ] Has an identifier
- [ ] View model is served as a DTO
- [ ] Follows builder pattern on mutations

***Value objects and Entity clases***
- [ ] Not accesible outside of the Aggregate root
- [ ] Use package private constructors to improve readability
- [ ] Contains its own validations

***Value objects***
- [ ] Does not have an identifier
- [ ] Attributes are always read only
- [ ] Create new instances. Do not edit attributes

***Entity classes***
- [ ] Has an identifier
- [ ] Follows builder pattern on mutations

```typescript
import { DocumentNameLimitExceeded } from './DocumentError';  
  
export class Document {  
  #id: string;  
  #name: Name;  
  
  private constructor(id: string, name: Name) {  
    this.#id = id;  
    this.#name = name;  
  }  
  
  public static create(id: string, name: string): Document {  
    return new Document(id, new Name(name));  
  }  
  
  public editName(name: string) {  
    this.#name = new Name(name);  
  }  
  
  public toDto(): DocumentDTO {  
    return {  
      id: this.#id,  
      name: this.#name.value,  
    };  
  }  
}  
  
export type DocumentDTO = {  
  id: string;  
  name: string;  
};  
  
class Name {  
  constructor(readonly value: string) {  
    if (value.length > 20) throw new DocumentNameLimitExceeded();  
    this.value = value;  
  }  
}
```
#### For projections 
- [ ] Can be represented as a DTO
- [ ] Does not contain business logic
**Note:** in CQRS context projections contains business logic. They are constructed iteratively from other domain events. We are following a pragmatic approach here to keep the layer but removing the complexity (evolutionary architecture)

```typescript
export type DocumentList = {  
  items: DocumentLisItem[];  
};  
  
type DocumentLisItem = {  
  id: string;  
  name: string;  
};
```
#### Error
- [ ] Parent class to improve error handling
- [ ] Business oriented naming
- [ ] One exception class per error
```typescript
export class DocumentError extends Error {  
  constructor(name: string, message: string) {  
    super(message);  
    this.name = name;  
    Object.setPrototypeOf(this, DocumentError.prototype);  
  }  
}  
  
export class DocumentNameLimitExceeded extends DocumentError {  
  constructor() {  
    super(  
      'DocumentNameLimitExceeded',  
      'Name can not be longer than 20 characters',  
    );  
  }  
}
```
#### Event

```typescript
// TODO
```
#### Repository
- [ ] Interface to keep clean architecture and delegate implementation using dependency injection 
- [ ] One repository per aggregate root only 
- [ ] One aggregate root per repository only

```typescript
import { type Document } from './';  
  
export interface DocumentRepository {  
  create(document: Document): Promise<void>;  
  
  update(document: Document): Promise<void>;  
  
  searchById(id: string): Promise<Document | null>;  
}
```
### Use case

#### Command

```typescript
import { Document, type DocumentRepository } from '../../domain';  
  
export class DocumentSaver {  
  constructor(readonly documentRepository: DocumentRepository) {}  
  
  async save(id: string, name: string): Promise<void> {  
    const storedDocument = await this.documentRepository.searchById(id);  
    if (!storedDocument) {  
      const document = Document.create(id, name);  
      await this.documentRepository.create(document);  
    } else {  
      storedDocument.editName(name);  
      await this.documentRepository.update(storedDocument);  
    }  
  }  
}
```
#### Query

```typescript
import { type DocumentDTO, type DocumentRepository } from '../../domain';  
  
export class DocumentSearcher {  
  constructor(readonly documentRepository: DocumentRepository) {}  
  
  async searchById(id: string): Promise<DocumentDTO | null> {  
    return (await this.documentRepository.searchById(id))?.toDto() || null;  
  }  
}
```

### Adapters

#### React

##### View Component
```typescript
import { useEffect, useState } from 'react';  
import { useDocumentContext } from './useDocumentContext';  
  
export function DocumentView({ id }: { id: string }) {  
  const { document, searchDocumentById } = useDocumentContext();  
  const [name, setName] = useState('');  
  
  useEffect(() => {  
    searchDocumentById(id).then(() => {  
      if (document) {  
        setName(document.name);  
      } else {  
        setName('New document');  
      }  
    });  
  }, [document, id, searchDocumentById]);  
  
  return (  
    <section>  
      <h2>{name}</h2>  
    </section>  
  );  
}
```

##### List view component
```typescript
import { useDocumentListContext } from './useDocumentListContext';  
  
export function DocumentListView() {  
  const { documentList } = useDocumentListContext();  
  return (  
    <section>  
      <h2>Document list</h2>  
      <ul>  
        {documentList.items.map((documentListItem) => (  
          <li key={documentListItem.id}>{documentListItem.name}</li>  
        ))}  
      </ul>  
    </section>  
  );  
}
```
##### Edit Component
```typescript
import { useEffect } from 'react';  
import { useFormData } from '../../../shared/adapter/presentation/useFormData';  
import { FormStatus, useDocumentForm } from './useDocumentForm';  
import { useDocumentContext } from './useDocumentContext';  
  
export function DocumentEdit({ id }: { id: string }) {  
  const initialState = {  
    id: id,  
    name: '',  
  };  
  const { formData, updateForm, resetForm } = useFormData(initialState);  
  const { formStatus, submitForm, resetFormStatus } = useDocumentForm();  
  const { document, searchDocumentById } = useDocumentContext();  
  useEffect(() => {  
    searchDocumentById(id).then(() => {  
      if (document) {  
        updateForm({ name: document.name });  
      }  
    });  
  }, [document, id, searchDocumentById, updateForm]);  
  
  const handleSubmit = async (ev: React.FormEvent) => {  
    ev.preventDefault();  
  
    await submitForm(formData);  
  };  
  switch (formStatus) {  
    case FormStatus.Loading:  
      return <p>Loading...</p>;  
    case FormStatus.Success:  
      return (  
        <>  
          <h2>Document saved!</h2>  
          <button onClick={resetForm}>Add new one</button>  
        </>  
      );  
    case FormStatus.Error:  
      return <button onClick={resetFormStatus}>Error! Try again</button>;  
    case FormStatus.Initial:  
      return (  
        <section>  
          <form onSubmit={(ev) => handleSubmit(ev)}>  
            <div>  
              <label htmlFor="name">Document name</label>  
              <input  
                id="name"  
                name="name"  
                type="text"  
                value={formData.name}  
                onChange={(ev) => {  
                  updateForm({ name: ev.target.value });  
                }}  
              />  
            </div>  
            <button type="submit">Save</button>  
          </form>  
        </section>  
      );  
    default:  
      assertUnreachable(formStatus);  
  }  
}  
  
function assertUnreachable(_x: never): never {  
  throw new Error('Unreachable code path');  
}
```
##### Hook form business state machine
It will store the form state machine
and all the possible transitions. OLD presenter
```typescript
import { useState } from 'react';  
import { useDocumentContext } from './useDocumentContext';  
  
export const enum FormStatus {  
  Loading,  
  Success,  
  Error,  
  Initial,  
}  
  
export function useDocumentForm(): {  
  formStatus: FormStatus;  
  submitForm: (formData: { id: string; name: string }) => Promise<void>;  
  resetFormStatus: () => void;  
} {  
  const [formStatus, setFormStatus] = useState(FormStatus.Initial);  
  const { saveDocument } = useDocumentContext();  
  
  async function submitForm({ id, name }: { id: string; name: string }) {  
    setFormStatus(FormStatus.Loading);  
  
    try {  
      await saveDocument({ id, name });  
      setFormStatus(FormStatus.Success);  
    } catch (e) {  
      setFormStatus(FormStatus.Error);  
    }  
  }  
  
  function resetFormStatus() {  
    setFormStatus(FormStatus.Initial);  
  }  
  
  return {  
    formStatus,  
    submitForm,  
    resetFormStatus,  
  };  
}
```
##### Generic hook to make partial form updates
Shared util, can be reused
```typescript
import { useState } from 'react';  
  
export const useFormData = <T>(  
  initialState: T,  
): {  
  formData: T;  
  updateForm: (value: Partial<T>) => void;  
  resetForm: () => void;  
} => {  
  const [formData, setFormData] = useState(initialState);  
  
  const updateForm = (value: Partial<typeof initialState>) => {  
    setFormData((oldState) => {  
      return { ...oldState, ...value };  
    });  
  };  
  
  const resetForm = () => {  
    setFormData(initialState);  
  };  
  
  return {  
    formData,  
    updateForm,  
    resetForm,  
  };  
};
```
##### Context Provider
Shared context around components to keep all of them updated at the same time.
- Example: when we add a course, we can update the course list view implicitly. 
- Example: Add optimistic updates.
```typescript
import React, { useContext, useState } from 'react';  
import { type DocumentDTO, type DocumentRepository } from '../../domain';  
import { DocumentSaver } from '../../usecases/commands';  
import { DocumentSearcher } from '../../usecases/queries';  
  
export interface DocumentState {  
  document: DocumentDTO | null;  
  saveDocument: (document: { id: string; name: string }) => Promise<void>;  
  searchDocumentById: (id: string) => Promise<void>;  
}  
  
export const DocumentContext = React.createContext({} as DocumentState);  
  
export const DocumentContextProvider = ({  
  children,  
  documentRepository,  
}: React.PropsWithChildren<{  
  documentRepository: DocumentRepository;  
}>) => {  
  const [document, setDocument] = useState<DocumentDTO | null>(null);  
  
  async function saveDocument({  
    id,  
    name,  
  }: {  
    id: string;  
    name: string;  
  }): Promise<void> {  
    const documentSaver = new DocumentSaver(documentRepository);  
    await documentSaver.save(id, name);  
  }  
  
  async function searchDocumentById(id: string): Promise<void> {  
    const documentSearcher = new DocumentSearcher(documentRepository);  
    const documentDTO = await documentSearcher.searchById(id);  
    setDocument(documentDTO);  
  }  
  
  return (  
    <DocumentContext.Provider  
      value={{ document, saveDocument, searchDocumentById }}  
    >  
      {children}  
    </DocumentContext.Provider>  
  );  
};  
  
export const useDocumentContext = () => useContext(DocumentContext);
```
##### App
Glue to initialize repositories
```typescript
import { ApiDocumentRepository } from './document/adapter/storage';  
import { DocumentContextProvider } from './document/adapter/presentation/useDocumentContext';  
import { DocumentListContextProvider } from './documentlist/adapter/presentation/useDocumentListContext';  
import { ApiDocumentListRepository } from './documentlist/adapter/storage';  
import { DocumentPage } from './documentpage/adapter/presentation/DocumentPage';  
  
// 1. Domain  
// 2. Use case  
// 3. Adapters  
// Plan  
// ---  
// *** Mutate state ***  
// - Single document (view mode)  
// - Single document (edit mode)  
// *** Projection ***  
// - List documents (view mode)  
  
export function App() {  
  const documentRepository = new ApiDocumentRepository();  
  const documentListRepository = new ApiDocumentListRepository();  
  return (  
    <DocumentContextProvider documentRepository={documentRepository}>  
      <DocumentListContextProvider  
        documentListRepository={documentListRepository}  
      >  
        <div>  
          <h1>Document App</h1>  
          <DocumentPage />  
        </div>  
      </DocumentListContextProvider>  
    </DocumentContextProvider>  
  );  
}
```
##### List view context provider
```typescript
import React, { useContext, useEffect } from 'react';  
import { type DocumentList, type DocumentListRepository } from '../../domain';  
import { DocumentListSearcher } from '../../usecases/queries';  
  
export interface DocumentListState {  
  documentList: DocumentList;  
}  
  
export const DocumentListContext = React.createContext({} as DocumentListState);  
  
export const DocumentListContextProvider = ({  
  children,  
  documentListRepository,  
}: React.PropsWithChildren<{  
  documentListRepository: DocumentListRepository;  
}>) => {  
  const documentListSearcher = new DocumentListSearcher(documentListRepository);  
  
  const [documentList, setDocumentList] = React.useState<DocumentList>({  
    items: [],  
  });  
  
  function searchDocumentList() {  
    documentListSearcher.searchAll().then((documentList) => {  
      setDocumentList(documentList);  
    });  
  }  
  
  useEffect(() => {  
    searchDocumentList();  
  }, []);  
  
  return (  
    <DocumentListContext.Provider value={{ documentList }}>  
      {children}  
    </DocumentListContext.Provider>  
  );  
};  
  
export const useDocumentListContext = () => useContext(DocumentListContext);
```
##### List view repository
```typescript
import { type DocumentList } from './';  
  
export interface DocumentListRepository {  
  searchAll(): Promise<DocumentList>;  
}
```
##### View test
```typescript
import { render, screen } from '@testing-library/react';  
import { DocumentMother } from '../../domain';  
import { InMemoryDocumentRepository } from '../storage';  
import { DocumentView } from './DocumentView';  
import { DocumentContextProvider } from './useDocumentContext';  
  
describe('DocumentView', () => {  
  it('should view document when document exists', async () => {  
    // Given  
    const document = DocumentMother.document();  
    const documentDto = document.toDto();  
    const documentRepository = new InMemoryDocumentRepository();  
    await documentRepository.create(document);  
    // When  
    render(  
      <DocumentContextProvider documentRepository={documentRepository}>  
        <DocumentView id={documentDto.id} />  
      </DocumentContextProvider>,  
    );  
    // Then  
    const documentName = await screen.findByRole('heading', {  
      name: documentDto.name,  
      level: 2,  
    });  
    expect(documentName).toBeVisible();  
  });  
  
  it('should view default name when document does not exist', async () => {  
    // Given  
    const document = DocumentMother.document();  
    const documentDto = document.toDto();  
    const documentRepository = new InMemoryDocumentRepository();  
    // When  
    render(  
      <DocumentContextProvider documentRepository={documentRepository}>  
        <DocumentView id={documentDto.id} />  
      </DocumentContextProvider>,  
    );  
    // Then  
    const documentName = await screen.findByRole('heading', {  
      name: /new document/i,  
      level: 2,  
    });  
    expect(documentName).toBeVisible();  
  });  
});
```
##### Edit test
```typescript
import { render, screen } from '@testing-library/react';  
import userEvent from '@testing-library/user-event';  
import { DocumentMother } from '../../domain';  
import { InMemoryDocumentRepository } from '../storage';  
import { DocumentEdit } from './DocumentEdit';  
import { DocumentContextProvider } from './useDocumentContext';  
  
describe('DocumentEdit', () => {  
  it('should save a document', async () => {  
    // Given  
    const document = DocumentMother.document();  
    const documentDto = document.toDto();  
    const documentRepository = new InMemoryDocumentRepository();  
    render(  
      <DocumentContextProvider documentRepository={documentRepository}>  
        <DocumentEdit id={documentDto.id} />  
      </DocumentContextProvider>,  
    );  
    const nameInput = screen.getByLabelText(/name/i);  
    userEvent.type(nameInput, documentDto.name);  
    // When  
    const submitButton = screen.getByText(/save/i);  
    userEvent.click(submitButton);  
    // Then  
    const successMessage = await screen.findByRole('heading', {  
      name: /saved/i,  
      level: 2,  
    });  
    expect(successMessage).toBeVisible();  
    const storedDocument = await documentRepository.searchById(documentDto.id);  
    expect(storedDocument?.toDto()).toEqual(documentDto);  
  });  
  
  it('should edit a document when already exists', async () => {  
    // Given  
    const document = DocumentMother.document();  
    const documentDto = document.toDto();  
    const documentRepository = new InMemoryDocumentRepository();  
    await documentRepository.create(document);  
    const editedName = 'Edited name';  
    render(  
      <DocumentContextProvider documentRepository={documentRepository}>  
        <DocumentEdit id={documentDto.id} />  
      </DocumentContextProvider>,  
    );  
    const nameInput = screen.getByLabelText(/name/i);  
    userEvent.type(nameInput, editedName);  
    // When  
    const submitButton = screen.getByText(/save/i);  
    userEvent.click(submitButton);  
    // Then  
    const successMessage = await screen.findByRole('heading', {  
      name: /saved/i,  
      level: 2,  
    });  
    expect(successMessage).toBeVisible();  
    const storedDocument = await documentRepository.searchById(documentDto.id);  
    expect(storedDocument?.toDto()).toEqual({  
      ...documentDto,  
      name: editedName,  
    });  
  });  
  
  it('should display stored document name', async () => {  
    // Given  
    const document = DocumentMother.document();  
    const documentDto = document.toDto();  
    const documentRepository = new InMemoryDocumentRepository();  
    await documentRepository.create(document);  
    // When  
    render(  
      <DocumentContextProvider documentRepository={documentRepository}>  
        <DocumentEdit id={documentDto.id} />  
      </DocumentContextProvider>,  
    );  
    // Then  
    const nameInput = await screen.findByDisplayValue(documentDto.name);  
    expect(nameInput).toBeVisible();  
  });  
});
```

##### Domain test
```typescript
import { DocumentMother, DocumentNameLimitExceeded } from './';  
  
describe('DocumentView', () => {  
  it('should create a new document', () => {  
    // Given  
    const id = 'stub-id';  
    const name = 'stub-name';  
    // When  
    const document = DocumentMother.document(id, name);  
    // Then  
    expect(document.toDto()).toEqual({ id, name });  
  });  
  
  it('should fail to create a document when has a name longer than 20 characters', () => {  
    expect(() => DocumentMother.documentWithInvalidName()).toThrow(  
      new DocumentNameLimitExceeded(),  
    );  
  });  
});
```

##### Domain object mother
```typescript
import { Document } from './';  
  
export class DocumentMother {  
  public static document(id = 'stub-id', name = 'stub-name'): Document {  
    return Document.create(id, name);  
  }  
  
  public static documentWithInvalidName(id = 'stub-id'): Document {  
    return this.document(  
      id,  
      '1-2-3-4-5-6-7-8-9-1-2-3-4-5-6-7-8-9-1-2-3-4-5-6-7-8-9',  
    );  
  }  
}
```

---
### Related
- [[DDD Applied - Domain]]
- [[DDD Applied - Use case]]
- [[Domain Driven Design - Domain]]
- [[Domain Driven Design - Use case]]
- [[Domain Driven Design - Layers]]
### References
- [Codely TV, 2026. GitHub repository - Frontend hexagonal architecture](https://github.com/CodelyTV/frontend-hexagonal_architecture-example)
### Tags
#domain-driven-design 