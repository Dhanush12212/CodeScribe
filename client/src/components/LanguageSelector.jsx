import { Box, MenuButton, MenuList, Menu, MenuItem, Text, Button } from '@chakra-ui/react' 
import { ChevronDownIcon } from 'lucide-react'
import React from 'react' 
import { LANGUAGE_VERSIONS } from '../constants'; 

const languages = Object.entries( LANGUAGE_VERSIONS );

function LanguageSelector({language,onSelect}) {
  return (
    <Box>  
      <Text mb={2} fontSize={['md','lg']}>Languages: </Text>
      <Menu> 
        <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
          {language}
        </MenuButton>
        <MenuList fontSize={['sm','md','lg']} fontWeight='semibold'>
          {
            languages.map(([lang, version]) => (
              <MenuItem 
                key={lang} 
                onClick={()=>onSelect(lang)}
                color={
                  lang === language ? "blue.400" : ""
                }
                bg={
                  lang === language ? "gray.900" : "transparent"
                }
                _hover={{
                  color: "blue.400",
                  bg: "gray.900"
                }}
              > 

              {lang} 
                &nbsp;
                &nbsp;
              <Text key={version} > ({version}) </Text>

              </MenuItem>
            )) 
          }
        </MenuList>
      </Menu>
    </Box>
  )
}

export default LanguageSelector