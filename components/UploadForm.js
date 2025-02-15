import Head from 'next/head'
import Moralis from 'moralis';
import { useMoralisFile, useRaribleLazyMint } from 'react-moralis'
// import { useState } from 'react/cjs/react.production.min'
import React, {useState} from 'react';

export default function UploadForm({logout, user}) {

    // creates state for name and description
    const [input, setInput] = useState({
      nftName:'',
      description:''
    })

    const [inputFile, setInputFile] = useState(null)

    // handles state change for values above
    const handleOnChange = (e) =>{
      setInput(prevState => ({
        ...prevState,
        [e.target.name]: e.target.value
      }))

    }

    const{saveFile} = useMoralisFile()

    const {lazyMint} = useRaribleLazyMint({
      // Can change to mainnet
      chain: 'eth',
      userAddress: user.get('ethAddress'),
      // Can change to ERC721
      tokenType: 'ERC1155',
      // Change to more if ERD721
      supply: 1,
      // Default to 10%
      royaltiesAmount: 10
    })

    console.log(input)

    return (
        <>
        <Head>
            <title>NFT Minter</title>
        </Head> 
        <div className='w-screen h-auto flex justify-end items-center'>
            <button onClick={logout} type="button" className='mt-6 mr-10 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>Logout</button>
        </div>
        <div className="flex items-center justify-center overflow-y-hidden">
            <div className="w-2/3 max-w-screen mt-6">
              {/* On Submit for whole form */}
              <form onSubmit={async e => {
                e.preventDefault()
                if(inputFile !== null && input.nftName.trim() !== '' && input.description.trim() !== '') {
                  await saveFile(input.nftName, inputFile, {
                    saveIPFS: true,
                    onSuccess: async (file) => {
                      let metadata = {
                        name: input.nftName,
                        description: input.description,
                        image: '/ipfs/' + file._hash
                      } 
                      await saveFile(`metadata ${input.nftName}`,  {
                        base64: btoa(JSON.stringify(metadata))
                      }, {
                        saveIPFS: true,
                        onSuccess: async (metadataFile) => {
                          console.log(metadataFile)
                          await Moralis.enableWeb3()
                          await lazyMint({
                            params:{
                              tokenUri: '/ipfs/' + metadataFile._hash
                            },
                            onSuccess: (res) => {
                              console.log(res)
                            }
                          })
                        }
                      } )
                      console.log(file)
                    },
                    onError: (error) => {
                      console.log(error)
                    }
                  })
                }
              }}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-3 sm:col-span-2">
                        <label htmlFor="nftName" className="block text-sm font-medium text-gray-700">
                          NFT Name
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="nftName"
                            id="nftName"
                            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                            placeholder="LyghtCode NFT"
                            value={input.nftName}
                            onChange={e => handleOnChange(e)}
                          />
                        </div>
                      </div>
                    </div>
  
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="Mint me!"
                          value={input.description}
                          onChange={e => handleOnChange(e)}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Brief description of the NFT.
                      </p>
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NFT file</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {inputFile !== null ? (
                            <p>{inputFile.name}</p>
                          ) : (
                            <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          )}
                         
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Upload your NFT</span>
                              <input onChange={e => setInputFile(e.target.files[0])} id="file-upload" name="file-upload" type="file" className="sr-only" />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Lazy-Mint now!
                    </button>
                  </div>
                </div>
              </form>
            </div>
        </div>
        </>
    )
  }
  