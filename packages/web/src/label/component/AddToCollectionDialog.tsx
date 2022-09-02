import { useToast, Box, Button, Checkbox, Flex, Grid, GridItem, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState, ChangeEventHandler, KeyboardEventHandler, ReactElement } from 'react';
import { BsGrid } from 'react-icons/bs';

import { getLogger, mapEquals, LabelIdentifier, LabelVisibility, LabelService, LabelTuple, Logger, Notebook, NotebookIdentifier, Scrollable, LabelNameMaxLength } from '@ureeka-notebook/web-service';

import { useValidatedAuthedUser } from 'authUser/hook/useValidatedAuthedUser';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
// == Type ========================================================================
interface Props {
  notebookId: NotebookIdentifier;
  notebook: Notebook;

  /** component to be used to open the Dialog. This component received the onClick
   *  handler that should be passed as a prop to the actual component. If no
   *  component is provided a default button is used.*/
  component?: (onClick: () => void) => React.ReactElement;
}
// == Component ===================================================================
export const AddToCollectionDialog: React.FC<Props> = ({ notebook, notebookId, component }) => {
  const { authedUser: { userId } } = useValidatedAuthedUser();

  // == State =====================================================================
  const [searchValue, setSearchValue] = useState(''/*initial value*/);

  const [scrollable, setScrollable] = useState<Scrollable<LabelTuple> | null/*no scrollable*/>(null/*initial value*/);
  const [allLabels, setAllLabels] = useState<LabelTuple[] | null/*no value*/>(null/*initial value*/);
  const [allLabelsStatus, setAllLabelsStatus] = useAsyncStatus();

  const [notebookLabels, setNotebookLabels] = useState<Map<LabelIdentifier, string/*label name*/> | null/*no value*/>(null/*initial value*/);
  const [notebookLabelsStatus, setNotebookLabelsStatus] = useAsyncStatus();

  const [currentLabels, setCurrentLabels] = useState<Map<LabelIdentifier, string/*label name*/> | null/*no value*/>(null/*initial value*/);
  // the status of the async saving operation
  const [currentLabelsStatus, setCurrentLabelsStatus] = useAsyncStatus();

  const [createLabelName, setCreateLabelName] = useState(''/*initial value*/);
  const [createLabelStatus, setCreateLabelStatus] = useAsyncStatus();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false/*by contract*/);
  // AreYourSure state
  const [isAYSOpen, setIsAYSOpen] = useState(false/*by contract*/);

  const toast = useToast();
  const isMounted = useIsMounted();

  // ..............................................................................
  // compares the initial labels for the Notebook with the current state
  const isDirty = (currentLabels !== null && notebookLabels !== null)/*not dirty if not loaded yet */ &&
                  !mapEquals(currentLabels, notebookLabels),
        isLoading = allLabelsStatus === 'loading' || notebookLabelsStatus === 'loading' || currentLabelsStatus === 'loading';

  // == Effect ====================================================================
  // resolves (loads) the initial Notebook Labels
  useEffect(() => {
    if(!isModalOpen) return/*nothing to do*/;

    setNotebookLabelsStatus('loading');
    // gets the Profile and store if in the map for each User
    const subscription = LabelService.getInstance().onNotebookLabels$(notebookId).subscribe({
      next: (labels) => {
        if(!isMounted()) return/*component is not mounted*/;

        setNotebookLabels(new Map(labels.map(label => [label.id, label.obj.name])));
        setCurrentLabels(new Map(labels.map(label => [label.id, label.obj.name])));

        setNotebookLabelsStatus('complete');
      },
      error: (err) => {
        log.error('Error while resolving Notebook Labels', err);
        if(!isMounted()) return/*component is not mounted*/;

        setNotebookLabelsStatus('error');
        toast({ title: 'Error while resolving Notebook Labels', description: err.message, status: 'error' });
      },
    });

    return () => { subscription.unsubscribe(); };
    // NOTE: only executed when modal is open. If this is meant to be executed
    //       each time the Notebook gets updated update the dependency array below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // gets the Scrollable of all the Labels based on the search value
  useEffect(() => {
    if(!isModalOpen) return/*nothing to do*/;

    const scrollable = LabelService.getInstance().onLabels({ namePrefix: searchValue, createdBy: userId, sort:[{ field:'name', direction: 'asc' }] }, 10/*FIXME: temporary for testing*/);
    setScrollable(scrollable);

    const subscription = scrollable.documents$().subscribe({
      next: value => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setAllLabels(value);
        setAllLabelsStatus('complete');
      },
      error: (error) => {
        log.info(`Unexpected error getting Notebooks. Error: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setAllLabelsStatus('error');
        toast({ title: 'Error while resolving Notebook Labels', description: error.message, status: 'error' });
      },
    });

    return () => subscription.unsubscribe();

    // NOTE: only executed when component is mounted. If this is meant to be executed
    //       each time the Notebook gets updated update the dependency array below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, searchValue]);

  // == Handler ===================================================================
  const resetState = () => {
    // Reset initial value
    setSearchValue(''/*initial value*/);
    setCreateLabelName(''/*initial value*/);
  };

  // -- Modal handlers ------------------------------------------------------------
  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => {
    // prevent modal from being closed while loading
    if(isLoading) return/*nothing to do*/;
    if(isDirty) { setIsAYSOpen(true); return/*nothing else to do*/; }

    resetState();
    setIsModalOpen(false);
  };

  // .. Check Label ...............................................................
  const handleCheckLabelClick = (label: LabelTuple) => {
    if(currentLabels === null) return/*nothing to do*/;

    const newLabels = new Map(currentLabels);
    if(newLabels.has(label.id)) newLabels.delete(label.id);
    else newLabels.set(label.id, label.obj.name);

    setCurrentLabels(newLabels);
  };

  // .. Create Label ..............................................................
  const handleCreateLabelInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    // crops the value into the allowed length.
    const value = event.target.value.slice(0, LabelNameMaxLength);
    setCreateLabelName(value);
  };

  /** creates a label when the user press enter */
  const handleCreateLabeKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if(event.key === 'Enter') handleCreateLabel();
  };

  const handleCreateLabel = async () => {
    if(createLabelName === '') return/*nothing to do*/;
    if(createLabelStatus === 'loading') return/*nothing to do*/;

    setCreateLabelStatus('loading');
    try {
      const labelId = await LabelService.getInstance().createLabel({
        name: createLabelName,
        visibility: LabelVisibility.Private/*default by contract*/,
        ordered: false/*default by contract*/,
      });
      if(!isMounted()) return/*component is not mounted*/;

      // reset status
      setCreateLabelStatus('complete');
      setCreateLabelName(''/*initial value*/);

      // add Label into the current Labels
      const newLabels = new Map(currentLabels);
      newLabels.set(labelId, createLabelName);
      setCurrentLabels(newLabels);
    } catch(error) {
      log.error('Error while creating Label', error);
      if(!isMounted()) return/*component is not mounted*/;

      setCreateLabelStatus('error');

      const message =  error instanceof Error ? error.message : `Unknown error.`;
      toast({ title: 'Error while creating Collection', description: message, status: 'error' });
    }
  };

  // -- AreYouSure handlers -------------------------------------------------------
  const handleAYSClose = () => setIsAYSOpen(false);
  const handleAYSConfirmation = () => {
    resetState();
    setIsAYSOpen(false);
    setIsModalOpen(false);
  };

  // -- Label handlers ------------------------------------------------------------
  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setSearchValue(value);
  };

  const handleSaveChanges = async () => {
    if(currentLabels === null) { log.error(`Execute handleSaveChanges in Notebook (${notebookId}) but currentLabels is null.`); return/*nothing to do*/; }
    if(isLoading) return/*nothing to do*/;

    try {
      setCurrentLabelsStatus('loading');

      const labelIds = Array.from(currentLabels.keys());
      await LabelService.getInstance().updateLabelsOnNotebook(notebookId, labelIds);

      setCurrentLabelsStatus('complete');
      toast({ title: 'Collections updated', status: 'success' });
      resetState();
      setIsModalOpen(false);
    } catch(error) {
      log.error(`Error updating Labels in Notebook (${notebookId}): `, error);
      if(!isMounted()) return/*nothing else to do*/;

      setCurrentLabelsStatus('error');
      toast({ title: 'Unexpected error updating Collection', description: /*show message only if present in error*/error instanceof Error ? error.message : undefined, status: 'error' });
    }
  };

  let content: ReactElement;
  // CHECK: Add specific error message for each type of error? The Toast already
  //        provides a more meaningful message
  if(allLabelsStatus === 'error' || notebookLabelsStatus === 'error' || currentLabelsStatus === 'error')
    content = (
      <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
        <Text>An error ocurred.</Text>
      </Flex>
    );
  else if(scrollable === null || allLabels === null || notebookLabels === null || currentLabels === null) {
    content = (
      <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
        <Loading />
      </Flex>
    );
  } else {
    content = (
      <Box>
        <Box marginBottom={4} paddingX={6}>
          <Input
            size='sm'
            autoFocus
            disabled={isLoading}
            placeholder='Filter collections'
            background='#FFFFFF'
            onChange={handleSearchChange}
          />
        </Box>

        <Text
          color='#AAA'
          fontSize={13}
          fontWeight={600}
          marginBottom={3}
          paddingX={6}
        >
          Collections({currentLabels.size})
        </Text>

        <Box height={200}>
          <Grid
            templateColumns='repeat(2, 1fr)'
            rowGap={2}
            columnGap={4}
            maxHeight='100%'
            overflowY='auto'
            paddingLeft={4}
            paddingRight={6}
          >
            {Array.from(allLabels).map((tuple) => {
              const isChecked = currentLabels.has(tuple.id);
              return (
                <GridItem width='100%' minWidth={0}  key={tuple.id}>
                  <Checkbox
                    width='100%'
                    paddingLeft={2}
                    overflow='hidden'
                    whiteSpace='nowrap'
                    isChecked={isChecked}
                    disabled={isLoading}
                    onChange={() => handleCheckLabelClick(tuple)}
                  >
                    <Text
                      textOverflow='ellipsis'
                      overflow='hidden'
                    >
                        {tuple.obj.name}
                    </Text>
                  </Checkbox>
                </GridItem>
              );
            })}
          </Grid>
        </Box>

        <Button size='sm' onClick={() => scrollable.moreDocuments()}>{scrollable.isExhausted() ? 'Exhausted' : 'Load More!'}</Button>
      </Box>
    );
  }

  // == UI ========================================================================
  return (
    <>
      {/* use component if provided */}
      {component ? component(handleOpen) : (
        <Button
          colorScheme='gray'
          variant='ghost'
          size='sm'
          leftIcon={<BsGrid size={16} />}
          onClick={handleOpen}
        >
          Add to collection
        </Button>
      )}

      <Modal isOpen closeOnEsc closeOnOverlayClick size='xl' onClose={handleClose} >
        {isModalOpen && (
        <>
          <ModalOverlay />

          <ModalContent >
            <ModalHeader>
              <Flex alignItems='center'>
                <BsGrid size={18} />
                <Text marginLeft={2}>Add to collection</Text>
              </Flex>
            </ModalHeader>

            <ModalCloseButton />

            <ModalBody paddingX={0} paddingBottom={4} background='#FAFAFA' borderY='1px solid #F0F0F0'>
              {content}
            </ModalBody>

            <ModalFooter>
              <Box width='full'>
                <Flex alignItems='center' marginBottom={2}>
                  <Box flex='1 1' minWidth={0} marginRight={2}>
                    <Input
                      size='sm'
                      value={createLabelName}
                      disabled={isLoading || createLabelStatus === 'loading'}
                      placeholder='New collection'
                      onChange={handleCreateLabelInputChange}
                      onKeyDown={handleCreateLabeKeyDown}
                    />
                  </Box>
                  {/** TODO: Change label in different status */}
                  <Button
                    disabled={createLabelName.length < 1 || isLoading || createLabelStatus === 'loading'}
                    size='sm'
                    colorScheme='blue'
                    width='70px'
                    onClick={handleCreateLabel}
                  >
                    {createLabelStatus === 'loading' ? <Spinner size='sm' /> : 'Create'}
                  </Button>
                </Flex>

                <Flex justifyContent='flex-end'>
                  {isDirty ? (
                    <>
                      <Button
                        key='cancel'
                        disabled={currentLabelsStatus === 'loading'}
                        variant='ghost'
                        size='sm'
                        marginRight={2}
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                      {currentLabelsStatus === 'loading' ? (
                        <Button key='save' disabled colorScheme='blue' size='sm'><Spinner size='sm'/></Button>
                      ):(
                        <Button key='save' colorScheme='blue' size='sm' onClick={handleSaveChanges}>Save</Button>
                      )}
                    </>
                  ):(
                    <Button key='done' colorScheme='blue' size='sm' onClick={handleClose}>Done</Button>
                  )}
                </Flex>
              </Box>
            </ModalFooter>
          </ModalContent>
        </>
        )}
      </Modal>

      <Modal isOpen closeOnEsc closeOnOverlayClick onClose={handleAYSClose}>
        {isAYSOpen && (
        <>
          <ModalOverlay />

          <ModalContent >
            <ModalHeader>
              <Flex alignItems='center'>
                <Text marginLeft={2}>Are you sure?</Text>
              </Flex>
            </ModalHeader>

            <ModalCloseButton />

            <ModalBody>
              <Text>Your are going to lose your changes.</Text>
            </ModalBody>

            <ModalFooter>
              <Button variant='ghost' marginRight={2} onClick={handleAYSClose}>Cancel</Button>
              <Button colorScheme='blue' autoFocus onClick={handleAYSConfirmation}>Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </>
        )}
      </Modal>
    </>
  );
};

